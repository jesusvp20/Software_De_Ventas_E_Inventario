import { GestionInventarioService } from "@/services/gestion-inventario.service";
import { NextRequest } from "next/server";
import { ApiResponseUtil } from "@/utils/api-response";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase-admin";



// ====================
// Instancia del servicio
// ====================
let inventarioService: GestionInventarioService | null = null;

try {
  if (!adminDb) {
    console.error(" adminDb es null o undefined");
  } else {
    inventarioService = new GestionInventarioService(adminDb);
    console.log(" GestionInventarioService creado correctamente para movimientos");
  }
} catch (error) {
  console.error(" Error creando GestionInventarioService:", error);
}

/**
 * POST /api/movimientos
 *
 * Acciones soportadas:
 * - "crear" (default): registra un movimiento en el historial sin afectar stock
 * - "actualizarStock": actualiza stock, registra historial y guarda el movimiento
 */
export async function POST(request: NextRequest) {
  try {
    //  Verificar que el servicio esté disponible
    if (!inventarioService) {
      const errorMsg = !adminDb 
        ? "Firebase Admin SDK no configurado (adminDb es null)" 
        : "Error al crear instancia del servicio";
      console.error("❌", errorMsg);
      return ApiResponseUtil.error(errorMsg, 503);
    }

    const body = await request.json();
    
    if (!body || !body.uid || !body.movimiento) {
      return ApiResponseUtil.error("Faltan datos: uid y movimiento", 400);
    }

    const accion = body.accion ?? "crear";
    let resultado;

    if (accion === "crear") {

      resultado = await inventarioService.registrarMovimientoInventario(
        String(body.uid),
        body.movimiento
      );

      await inventarioService.registrarHistorialCambio(
        String(body.uid),
        body.movimiento.productoId ?? "sin_id",
        {}, // estado antes (vacío)
        { ...body.movimiento } // estado después
      );

    } else if (accion === "actualizarStock") {
      //  Validación adicional para actualizar stock
      if (!body.idProducto) {
        return ApiResponseUtil.error("Falta el idProducto para actualizar stock", 400);
      }

      resultado = await inventarioService.actualizarStock(
        String(body.uid),
        body.movimiento,
        String(body.idProducto)
      );

    } else {
      return ApiResponseUtil.error(`Acción no reconocida: ${accion}. Acciones válidas: 'crear', 'actualizarStock'`, 400);
    }

    return ApiResponseUtil.success(
      { 
        mensaje: "Movimiento procesado correctamente", 
        resultado,
        accion: accion 
      },
      "Movimiento registrado",
      201
    );

  } catch (error: any) {
    console.error("❌ Error en POST /api/movimientos:", error);
    return ApiResponseUtil.error(
      `Error al registrar movimiento: ${error.message}` || "Error al registrar movimiento", 
      500
    );
  }
}

// ====================
// GET: Consultar movimientos 
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
    const uid = searchParams.get("uid");
    const productoId = searchParams.get("productoId");

    if (!uid) {
      return ApiResponseUtil.error("Falta el parámetro uid", 400);
    }

    const movimientos = productoId 
      ? await inventarioService.consultarMovimientosProducto(String(uid), String(productoId))
      : await inventarioService.consultarTodosMovimientos(String(uid));

    return ApiResponseUtil.success(
      movimientos, 
      "Movimientos consultados correctamente", 
      200
    );

  } catch (error: any) {
    console.error(" Error en GET /api/movimientos:", error);
    return ApiResponseUtil.error(
      `Error al consultar movimientos: ${error.message}`, 
      500
    );
  }
}