export interface ProductoInterface {
  id?: string,
  nombre: string;
  codigoBarras: string;
  descripcion: string;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  unidadMedida: string;
  categoria: string;
  ubicacionTienda: string;
}

export interface FiltrosProducto {
  nombre?: string;
  codigoBarras?: string;
  categoria?: string;
  stockMinimo?: number;
}

export interface MovimientoInventario {
  idProducto: string;
  tipo: 'entrada' | 'salida' | 'merma' | 'ajuste';
  cantidad: number;
  usuario: string; 
  fecha: Date;
  razon: string;
}