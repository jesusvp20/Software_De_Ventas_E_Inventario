import { 
  getFirestore, 
  CollectionReference, 
  DocumentReference,
  FieldValue 
} from 'firebase-admin/firestore';

// Servicio de autenticación para verificar permisos de administrador
import { AuthService } from './auth.service';

// Interfaces de tipado
import { ProductoInterface, FiltrosProducto, MovimientoInventario } from '@/types/productoInterface';

/**
 * Servicio de gestión de inventario para Next.js (Backend)
 * Usa Firebase Admin SDK en lugar de AngularFire
 */
export class GestionInventarioService {
  private db: FirebaseFirestore.Firestore;

  constructor(adminDb: FirebaseFirestore.Firestore) {
    this.db = adminDb;
  }

  /**
   * Registrar un nuevo producto
   */
  async registrarProducto(uid: string, producto: ProductoInterface) {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden registrar productos.');
    
    const productosRef = this.db.collection('productos');
    
    const docRef = await productosRef.add(producto);
    return { id: docRef.id };
  }

  /**
   * Actualizar un producto existente
   */
  async actualizarProducto(uid: string, idProducto: string, datosActualizados: Partial<ProductoInterface>) {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden actualizar productos.');

    const productoRef = this.db.collection('productos').doc(idProducto);
    await productoRef.update(datosActualizados);
    return { id: idProducto };
  }

  /**
   * Eliminar un producto por ID
   */
  async eliminarProducto(uid: string, idProducto: string) {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden eliminar productos.');

    const productoRef = this.db.collection('productos').doc(idProducto);
    await productoRef.delete();
    return { id: idProducto };
  }

  /**
   * Consultar todos los productos sin filtros
   */
  async consultarTodosProductos(): Promise<(ProductoInterface & { id: string })[]> {
    const productosRef = this.db.collection('productos');
    const snapshot = await productosRef.get();
    
    if (snapshot.empty) {
      throw new Error('No se encontraron productos en el inventario.');
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProductoInterface & { id: string }));
  }

  /**
   * Consultar productos aplicando filtros
   */
  async consultarProductos(filtros?: FiltrosProducto): Promise<(ProductoInterface & { id: string })[]> {
    let consulta: FirebaseFirestore.Query = this.db.collection('productos');
    
    if (filtros) {
      if (filtros.nombre) {
        consulta = consulta
          .where('nombre', '>=', filtros.nombre)
          .where('nombre', '<=', filtros.nombre + '\uf8ff');
      }
      if (filtros.codigoBarras) {
        consulta = consulta.where('codigoBarras', '==', filtros.codigoBarras);
      }
      if (filtros.categoria) {
        consulta = consulta.where('categoria', '==', filtros.categoria);
      }
    }
    
    const snapshot = await consulta.get();
    
    if (snapshot.empty) {
      throw new Error('No se encontraron productos con los filtros aplicados.');
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProductoInterface & { id: string }));
  }

  /**
   * Registrar movimiento en inventario
   */
  async registrarMovimientoInventario(uid: string, movimiento: MovimientoInventario) {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden registrar movimientos de inventario.');

    const tipoMovimientos = ["entrada", "salida", "merma", "ajuste"];
    if (!tipoMovimientos.includes(movimiento.tipo)) {
      throw new Error(`Tipo de movimiento inválido. Debe ser uno de: ${tipoMovimientos.join(', ')}`);
    }

    if (movimiento.tipo === 'merma' && !movimiento.razon) {
      throw new Error('Debe especificar la razón de la merma (dañado o vencido)');
    }

    const movimientoRef = this.db.collection('movimientos_inventario');
    const docRef = await movimientoRef.add({
      ...movimiento,
      fecha: FieldValue.serverTimestamp(),
      usuario: uid
    });
    
    return { id: docRef.id };
  }

  /**
   * Actualizar stock de un producto
   */
  async actualizarStock(uid: string, movimiento: MovimientoInventario, idProducto: string) {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden registrar movimientos de inventario.');

    // Obtener producto actual
    const productoRef = this.db.collection('productos').doc(idProducto);
    const productoDoc = await productoRef.get();

    if (!productoDoc.exists) throw new Error('Producto no encontrado');

    const productoData = productoDoc.data() as ProductoInterface;
    const stockAnterior = productoData.stock ?? 0;
    let nuevoStock = stockAnterior;

    // Ajustar stock según movimiento
    switch (movimiento.tipo) {
      case 'entrada':
        nuevoStock += movimiento.cantidad;
        break;
      case 'salida':
      case 'merma':
        if (nuevoStock - movimiento.cantidad < 0) {
          throw new Error('No hay suficiente stock para este movimiento');
        }
        nuevoStock -= movimiento.cantidad;
        break;
      case 'ajuste':
        if (movimiento.cantidad < 0) throw new Error('Cantidad inválida para ajuste');
        nuevoStock = movimiento.cantidad;
        break;
      default:
        throw new Error('Tipo de movimiento inválido');
    }

    // Registrar historial de cambio
    await this.registrarHistorialCambio(uid, idProducto, { stock: stockAnterior }, { stock: nuevoStock });

    // Actualizar stock en Firestore
    await productoRef.update({ stock: nuevoStock });

    // Registrar movimiento en inventario
    await this.registrarMovimientoInventario(uid, movimiento);

    // Generar alerta si stock crítico
    if (nuevoStock <= productoData.stockMinimo) {
      const alertasRef = this.db.collection('alertas_inventario');
      await alertasRef.add({
        productoId: idProducto,
        nombreProducto: productoData.nombre,
        stockActual: nuevoStock,
        stockMinimo: productoData.stockMinimo,
        mensaje: `Stock crítico: ${productoData.nombre} tiene ${nuevoStock} unidades restantes`,
        fecha: FieldValue.serverTimestamp(),
        usuario: uid,
      });
    }

    return nuevoStock;
  }

  /**
   * Registrar historial de cambios de producto
   */
  async registrarHistorialCambio(uid: string, idProducto: string, datosAnteriores: Partial<ProductoInterface>, datosNuevos: Partial<ProductoInterface>) {
    const historialRef = this.db.collection('historial_cambios');
    const docRef = await historialRef.add({
      productoId: idProducto,
      antes: datosAnteriores,
      despues: datosNuevos,
      usuario: uid,
      fecha: FieldValue.serverTimestamp(),
    });
    
    return { id: docRef.id };
  }

  // ====================
  // MÉTODOS FALTANTES PARA CONSULTAR MOVIMIENTOS
  // ====================

  /**
   * Consultar todos los movimientos de inventario de un usuario
   */
  async consultarTodosMovimientos(uid: string): Promise<(MovimientoInventario & { id: string })[]> {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden consultar movimientos.');

    const movimientosRef = this.db.collection('movimientos_inventario');
    const snapshot = await movimientosRef
      .orderBy('fecha', 'desc')
      .get();
    
    if (snapshot.empty) {
      return []; // Retornar array vacío en lugar de error
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MovimientoInventario & { id: string }));
  }

  /**
   * Consultar movimientos de un producto específico
   */
  async consultarMovimientosProducto(uid: string, productoId: string): Promise<(MovimientoInventario & { id: string })[]> {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden consultar movimientos.');

    const movimientosRef = this.db.collection('movimientos_inventario');
    const snapshot = await movimientosRef
      .where('productoId', '==', productoId)
      .orderBy('fecha', 'desc')
      .get();
    
    if (snapshot.empty) {
      return []; // Retornar array vacío en lugar de error
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MovimientoInventario & { id: string }));
  }

  /**
   * Consultar historial de cambios de un producto
   */
  async consultarHistorialProducto(uid: string, productoId: string): Promise<any[]> {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden consultar historial.');

    const historialRef = this.db.collection('historial_cambios');
    const snapshot = await historialRef
      .where('productoId', '==', productoId)
      .orderBy('fecha', 'desc')
      .get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Consultar alertas de stock crítico
   */
  async consultarAlertas(uid: string): Promise<any[]> {
    const esAdmin = await AuthService.isAdmin(uid);
    if (!esAdmin) throw new Error('Acceso denegado: solo los administradores pueden consultar alertas.');

    const alertasRef = this.db.collection('alertas_inventario');
    const snapshot = await alertasRef
      .orderBy('fecha', 'desc')
      .limit(50)
      .get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}