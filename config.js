// Configuration Auth0 + Supabase pour Cares Capital Group
// ⚠️  SÉCURITÉ: Les clés API sont maintenant chargées depuis les variables d'environnement

// Fonction pour charger les variables d'environnement de manière sécurisée
function loadEnvironmentConfig() {
    // En production, ces valeurs devraient venir des variables d'environnement du serveur
    // En développement, elles peuvent être définies dans config.env (non committé)
    
    // Valeurs par défaut pour le développement (à remplacer par vos vraies clés)
    const defaultConfig = {
        AUTH0_DOMAIN: 'dev-8pbxwvmgwfqemvol.us.auth0.com',
        AUTH0_CLIENT_ID: 'XKG3cm17aDx8ZfT72jrI3fYyHH5hN8Lt',
        SUPABASE_URL: 'https://nekaqgbntiwbxslfrxkj.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5la2FxZ2JudGl3YnhzbGZyeGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTk1NjYsImV4cCI6MjA3MzE3NTU2Nn0.XMfHIqVjw2PJWCLBBhihYJfCVJL5mvDiok_7TOw-AVY'
    };

    // Charger depuis les variables d'environnement si disponibles
    window.AUTH0_DOMAIN = process?.env?.AUTH0_DOMAIN || defaultConfig.AUTH0_DOMAIN;
    window.AUTH0_CLIENT_ID = process?.env?.AUTH0_CLIENT_ID || defaultConfig.AUTH0_CLIENT_ID;
    window.SUPABASE_URL = process?.env?.SUPABASE_URL || defaultConfig.SUPABASE_URL;
    window.SUPABASE_ANON_KEY = process?.env?.SUPABASE_ANON_KEY || defaultConfig.SUPABASE_ANON_KEY;
    window.REDIRECT_URI = process?.env?.REDIRECT_URI || (window.location.origin + '/dashboard.html');

    // Log de sécurité - ne pas exposer les clés complètes
    console.log('🔒 Configuration chargée:', {
        AUTH0_DOMAIN: window.AUTH0_DOMAIN,
        AUTH0_CLIENT_ID: window.AUTH0_CLIENT_ID?.substring(0, 8) + '...',
        SUPABASE_URL: window.SUPABASE_URL,
        SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY?.substring(0, 20) + '...'
    });
}

// Charger la configuration
loadEnvironmentConfig();

// Variables globales
let auth0Client = null;
let supabaseClient = null;

// Initialisation Auth0
async function initAuth0() {
    try {
        // Attendre que Auth0 soit chargé
        let attempts = 0;
        while (typeof auth0 === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof auth0 === 'undefined') {
            throw new Error('Auth0 SDK non chargé après 5 secondes. Vérifiez que le script est inclus dans le HTML.');
        }
        
        console.log('🔄 Création du client Auth0...');
        auth0Client = await auth0.createAuth0Client({
            domain: window.AUTH0_DOMAIN,
            clientId: window.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.REDIRECT_URI,
                audience: window.SUPABASE_URL // Utiliser Supabase comme audience
            }
        });

        console.log('✅ Auth0 initialisé');
        return auth0Client;
    } catch (error) {
        console.error('❌ Erreur Auth0:', error);
        throw error;
    }
}

// Initialisation Supabase
async function initSupabase() {
    try {
        // Attendre que Supabase soit chargé
        let attempts = 0;
        while (typeof window.supabase === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase SDK non chargé après 5 secondes. Vérifiez que le script est inclus dans le HTML.');
        }
        
        console.log('🔄 Création du client Supabase...');
        supabaseClient = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY
        );

        console.log('✅ Supabase initialisé');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
    }
}

// Connexion Auth0
async function login() {
    try {
        console.log('🔄 Initialisation de la connexion...');
        
        // Vérifier que Auth0 est disponible
        if (typeof auth0 === 'undefined') {
            throw new Error('Auth0 SDK non chargé. Veuillez recharger la page.');
        }
        
        console.log('🔄 Création du client Auth0...');
        const auth0Client = await auth0.createAuth0Client({
            domain: window.AUTH0_DOMAIN,
            clientId: window.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.REDIRECT_URI
            }
        });
        
        console.log('🔄 Redirection vers Auth0...');
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                screen_hint: 'login'
            }
        });
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        alert('Erreur de connexion: ' + error.message);
    }
}

// Connexion Auth0 (création de compte)
async function signup() {
    try {
        console.log('🔄 Initialisation de l\'inscription...');
        
        // Vérifier que Auth0 est disponible
        if (typeof auth0 === 'undefined') {
            throw new Error('Auth0 SDK non chargé. Veuillez recharger la page.');
        }
        
        console.log('🔄 Création du client Auth0...');
        const auth0Client = await auth0.createAuth0Client({
            domain: window.AUTH0_DOMAIN,
            clientId: window.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.REDIRECT_URI
            }
        });
        
        console.log('🔄 Redirection vers Auth0 pour inscription...');
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                screen_hint: 'signup'
            }
        });
    } catch (error) {
        console.error('❌ Erreur d\'inscription:', error);
        alert('Erreur d\'inscription: ' + error.message);
    }
}

// Déconnexion
async function logout() {
    try {
        if (auth0Client) {
            await auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        }
        
        // Nettoyer Supabase
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        
        // Nettoyer le localStorage
        localStorage.clear();
    } catch (error) {
        console.error('❌ Erreur de déconnexion:', error);
    }
}

// Vérifier l'authentification
async function checkAuth() {
    try {
        if (!auth0Client) await initAuth0();
        if (!supabaseClient) await initSupabase();

        const isAuthenticated = await auth0Client.isAuthenticated();
        
        if (isAuthenticated) {
            const user = await auth0Client.getUser();
            console.log('✅ Utilisateur connecté:', user);
            
            // Synchroniser avec Supabase
            await syncUserWithSupabase(user);
            
            return user;
        } else {
            console.log('❌ Utilisateur non connecté');
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur de vérification:', error);
        return null;
    }
}

// Synchroniser l'utilisateur Auth0 avec Supabase
async function syncUserWithSupabase(auth0User) {
    try {
        if (!supabaseClient) await initSupabase();

        // Vérifier si l'utilisateur existe dans Supabase
        const { data: existingUser, error: fetchError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('user_id', auth0User.sub)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        // Si l'utilisateur n'existe pas, le créer
        if (!existingUser) {
            const { data: newUser, error: insertError } = await supabaseClient
                .from('users')
                .insert({
                    user_id: auth0User.sub,
                    email: auth0User.email,
                    full_name: auth0User.name,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (insertError) throw insertError;
            console.log('✅ Utilisateur créé dans Supabase:', newUser);
    } else {
            console.log('✅ Utilisateur existant dans Supabase:', existingUser);
        }
    } catch (error) {
        console.error('❌ Erreur de synchronisation Supabase:', error);
    }
}

// Obtenir les données utilisateur depuis Supabase
async function getUserData() {
    try {
        if (!supabaseClient) await initSupabase();

        const { data: user, error } = await supabaseClient
            .from('users')
            .select(`
                *,
                user_profiles(*),
                loan_applications(*),
                user_documents(*)
            `)
            .eq('user_id', (await auth0Client.getUser()).sub)
            .single();

        if (error) throw error;
        return user;
    } catch (error) {
        console.error('❌ Erreur récupération données:', error);
        return null;
    }
}

// Sauvegarder les données utilisateur
async function saveUserData(data) {
    try {
        if (!supabaseClient) await initSupabase();

        const { error } = await supabaseClient
            .from('users')
            .update(data)
            .eq('user_id', (await auth0Client.getUser()).sub);

        if (error) throw error;
        console.log('✅ Données sauvegardées');
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
    }
}

// Fonction de test pour vérifier les SDKs
function testSDKs() {
    console.log('🔍 Test des SDKs...');
    console.log('Auth0 disponible:', typeof auth0 !== 'undefined');
    console.log('Supabase disponible:', typeof window.supabase !== 'undefined');
    console.log('Auth0 createAuth0Client:', typeof auth0?.createAuth0Client);
    console.log('Supabase createClient:', typeof window.supabase?.createClient);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Initialisation de l\'application...');
        
        // Test des SDKs
        testSDKs();
        
        // Attendre un peu pour que les scripts se chargent
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test après délai
        testSDKs();
        
        await initAuth0();
        await initSupabase();
        
        // Vérifier l'authentification
        const user = await checkAuth();
        
        if (user) {
            console.log('✅ Utilisateur authentifié');
        } else {
            console.log('❌ Redirection vers connexion');
        }
    } catch (error) {
        console.error('❌ Erreur d\'initialisation:', error);
    }
});

function logSecurityEvent(event, details) {
    console.log(`🔒 [SECURITY] ${event}:`, details);
    
    // Envoyer à un service de monitoring (optionnel)
    // fetch('/api/security-logs', { method: 'POST', body: JSON.stringify({event, details}) });
}

// Utiliser dans les fonctions critiques (exemples)
// logSecurityEvent('USER_LOGIN', { userId: user.sub, timestamp: new Date() });
// logSecurityEvent('DATA_ACCESS', { table: 'users', userId: user.sub });