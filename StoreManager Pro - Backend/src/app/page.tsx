export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            StoreManager Pro API
          </h1>
          <p className="text-gray-600 mb-6">
            Backend API para la aplicación StoreManager Pro
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>🚀 Servidor ejecutándose correctamente</p>
            <p>🔥 Firebase Admin SDK configurado</p>
            <p>🔐 Autenticación JWT implementada</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Endpoints disponibles:</h2>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>POST /api/auth/register</li>
              <li>POST /api/auth/login</li>
              <li>POST /api/auth/reset-password</li>
              <li>GET /api/auth/verify</li>
              <li>GET /api/users</li>
              <li>GET /api/users/[uid]</li>
              <li>PUT /api/users/[uid]</li>
              <li>DELETE /api/users/[uid]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}