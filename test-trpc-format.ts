import axios from "axios";

async function testTRPCFormat() {
  console.log("🔍 Test du format tRPC correct...");
  
  try {
    // Format tRPC correct
    const response = await axios.post(
      "https://association-manager-app.onrender.com/api/trpc/localAuth.login",
      {
        "0": {
          "json": {
            "email": "admin@batisseurs-engages.fr",
            "password": "Admin123!"
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("✅ Connexion réussie!");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
    
  } catch (error: any) {
    console.error("❌ Erreur de connexion:");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Request:", error.request);
    } else {
      console.error("Message:", error.message);
    }
  }
}

testTRPCFormat();
