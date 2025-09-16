// /app/api/gestion-inventario/route.ts
import { GestionInventarioService } from "@/services/gestion-inventario.service";
import { NextRequest } from "next/server";
import { ApiResponseUtil } from "@/utils/api-response";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase-admin";



// ====================
// Instancia del servicio
// ====================
let inventarioService: GestionInventarioService | null = null

try {
  if (!adminDb) {
    console.error(" adminDb es null o undefined");
  } else {
    inventarioService = new GestionInventarioService(adminDb);
    console.log(" GestionInventarioService creado correctamente");
  }
} catch (error) {
  console.error(" Error creando GestionInventarioService:", error);
}

// ====================
// GET: Listar productos
// ====================
export async function GET(request: NextRequest) {
  try {
    if (!inventarioService) {
      const errorMsg = !adminDb 
        ? "Firebase Admin SDK no configurado (adminDb es null)" 
        : "Error al crear instancia del servicio";
      console.error("❌", errorMsg);
      return ApiResponseUtil.error(errorMsg, 503);
    }

    const { searchParams } = new URL(request.url);
    const filtros: any = {};
    if (searchParams.has("nombre")) filtros.nombre = searchParams.get("nombre") || undefined;
    if (searchParams.has("codigoBarras")) filtros.codigoBarras = searchParams.get("codigoBarras") || undefined;
    if (searchParams.has("categoria")) filtros.categoria = searchParams.get("categoria") || undefined;

    const productos = Object.keys(filtros).length
      ? await inventarioService.consultarProductos(filtros)
      : await inventarioService.consultarTodosProductos();

    return ApiResponseUtil.success(productos, "Productos consultados", 200);
    
  } catch (error: any) {
    return ApiResponseUtil.error(`Error al consultar productos: ${error.message}`, 500);
  }
}

// ====================
// POST: Registrar producto
// ====================
export async function POST(request: NextRequest) {
  try {
    if (!inventarioService) {
      const errorMsg = !adminDb 
        ? "Firebase Admin SDK no configurado (adminDb es null)" 
        : "Error al crear instancia del servicio";
      return ApiResponseUtil.error(errorMsg, 503);
    }

    const body = await request.json();
    if (!body?.uid || !body?.producto) return ApiResponseUtil.error("Faltan datos (uid y producto)", 400);

    const nuevo = await inventarioService.registrarProducto(String(body.uid), body.producto);
    return ApiResponseUtil.success({ mensaje: "Producto registrado correctamente", id: String(nuevo.id) }, "Producto registrado", 201);

  } catch (error: any) {
    return ApiResponseUtil.error(`Error al registrar producto: ${error.message}`, 500);
  }
}

// ====================
// PUT: Actualizar producto
// ====================
export async function PUT(request: NextRequest) {
  try {
    if (!inventarioService) {
      const errorMsg = !adminDb 
        ? "Firebase Admin SDK no configurado (adminDb es null)" 
        : "Error al crear instancia del servicio";
      return ApiResponseUtil.error(errorMsg, 503);
    }

    const body = await request.json();
    if (!body?.uid || !body?.id || !body?.data) return ApiResponseUtil.error("Faltan datos (uid, id y data)", 400);

    await inventarioService.actualizarProducto(String(body.uid), String(body.id), body.data);
    return ApiResponseUtil.success({ mensaje: "Producto actualizado correctamente" }, "Producto actualizado", 200);

  } catch (error: any) {
    return ApiResponseUtil.error(`Error al actualizar producto: ${error.message}`, 500);
  }
}

// ====================
// DELETE: Eliminar producto
// ====================
export async function DELETE(request: NextRequest) {
  try {
    if (!inventarioService) {
      const errorMsg = !adminDb 
        ? "Firebase Admin SDK no configurado (adminDb es null)" 
        : "Error al crear instancia del servicio";
      return ApiResponseUtil.error(errorMsg, 503);
    }

    const body = await request.json();
    if (!body?.uid || !body?.id) return ApiResponseUtil.error("Faltan datos (uid y id)", 400);

    await inventarioService.eliminarProducto(String(body.uid), String(body.id));
    return ApiResponseUtil.success({ mensaje: "Producto eliminado correctamente" }, "Producto eliminado", 200);

  } catch (error: any) {
    return ApiResponseUtil.error(`Error al eliminar producto: ${error.message}`, 500);
  }
}
