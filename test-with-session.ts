import axios from "axios";

async function testWithSession() {
  console.log("Test de connexion avec session...");
  
  try {
    // D'abord créer une session avec le mot de passe valide
    const loginResponse = await axios.post(
      "https://association-manager-app.onrender.com/api/trpc/localAuth.login",
      [{
        "json": {
          "email": "admin@batisseurs-engages.fr",
          "password": "Admin123!"
        }
      }],
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Login response:", loginResponse.data);
    
    // Si le login réussit, tester avec le token
    if (loginResponse.data && loginResponse.data[0] && loginResponse.data[0].result && loginResponse.data[0].result.data && loginResponse.data[0].result.data.json) {
      const loginResult = loginResponse.data[0].result.data.json;
      
      if (loginResult.success && loginResult.sessionToken) {
        console.log("Session token obtenu:", loginResult.sessionToken);
        
        // Tester une requête protégée
        const protectedResponse = await axios.get(
          "https://association-manager-app.onrender.com/api/trpc/users.getProfile",
          {
            headers: {
              'Content-Type': 'application/json',
              'x-session-token': loginResult.sessionToken
            }
          }
        );
        
        console.log("Profile response:", protectedResponse.data);
      }
    }
    
  } catch (error: any) {
    console.error("Erreur:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}

testWithSession();
