import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';

async function testSimpleLogin() {
  console.log("🔍 Test avec client tRPC...");
  
  try {
    // Créer un client tRPC comme le frontend
    const client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "https://association-manager-app.onrender.com/api/trpc",
          headers() {
            return {};
          },
        }),
      ],
    });

    // Appeler la procédure de login
    const result = await client.localAuth.login.mutate({
      email: "admin@batisseurs-engages.fr",
      password: "Admin123!"
    });
    
    console.log("✅ Connexion réussie!");
    console.log("Result:", result);
    
  } catch (error: any) {
    console.error("❌ Erreur de connexion:");
    console.error("Message:", error.message);
    console.error("Data:", error.data);
    console.error("Code:", error.code);
  }
}

testSimpleLogin();
