import axios from "axios";

async function testLoginAPI() {
  console.log("🔍 Test de l'API de connexion...");
  
  try {
    const response = await axios.post(
      "https://association-manager-app.onrender.com/api/trpc/localAuth.login",
      {
        email: "admin@batisseurs-engages.fr",
        password: "Admin123!"
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
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request:", error.request);
    } else {
      console.error("Message:", error.message);
    }
  }
}

testLoginAPI();
