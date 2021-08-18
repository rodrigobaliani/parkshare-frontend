const FIREBASE_ERROR_MESSAGES = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
    'auth/weak-password': 'Su contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Formato de email inválido',
    'auth/wrong-password': 'Email o contraseña incorrecta',
    'auth/user-not-found': 'Email o contraseña incorrecta',
    'default': 'Se ha producido un error'
}

const DEFAULT_CODE = 'default';


export function getFirebaseErrorMessage(code) {
    return FIREBASE_ERROR_MESSAGES[code] || FIREBASE_ERROR_MESSAGES[DEFAULT_CODE]
}