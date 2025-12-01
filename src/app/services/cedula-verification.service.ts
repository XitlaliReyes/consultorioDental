// cedula-verification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CedulaVerificationResult {
  isValid: boolean;
  data?: {
    nombre: string;
    apellidos: string;
    cedula: string;
    profesion: string;
    institucion: string;
    fechaExpedicion?: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CedulaVerificationService {

  constructor(private http: HttpClient) {}

  /**
   * Método principal: Verifica cédula usando el backend
   */
  verificarCedula(cedula: string, nombre: string, apellidos: string): Observable<CedulaVerificationResult> {
    // CAMBIAR ESTA URL por la de tu backend
    const url = 'https://consultorio-backend-production-9816.up.railway.app/api/verificar-cedula'; // ← AJUSTA EL PUERTO SI ES NECESARIO
    
    console.log('🔍 Verificando cédula con backend:', { cedula, nombre, apellidos });

    return this.http.post<CedulaVerificationResult>(url, {
      cedula,
      nombre,
      apellidos
    }).pipe(
      map(response => {
        console.log('📡 Respuesta del backend:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error al verificar con backend:', error);
        return of({
          isValid: false,
          error: 'Error al conectar con el servidor. Verifica que el backend esté corriendo.'
        });
      })
    );
  }

  /**
   * OPCIÓN 1: Usar la API pública de la SEP (Gratis pero puede ser inestable)
   * Esta opción consulta directamente la base de datos pública de la SEP
   */
  verificarCedulaSEP(cedula: string, nombre: string, apellidos: string): Observable<CedulaVerificationResult> {
    // 🧪 MODO DE PRUEBA: Cédulas válidas para testing
    const cedulasPrueba = [
      { cedula: '12345678', nombre: 'JUAN', apellidos: 'PEREZ LOPEZ', profesion: 'CIRUJANO DENTISTA', institucion: 'UNIVERSIDAD NACIONAL' },
      { cedula: '11111111', nombre: 'MARIA', apellidos: 'GARCIA RODRIGUEZ', profesion: 'MEDICO CIRUJANO', institucion: 'UNAM' },
      { cedula: '99999999', nombre: 'ANGEL', apellidos: 'ROME DEMO', profesion: 'CIRUJANO DENTISTA', institucion: 'UAA' }
    ];

    // Verificar si es una cédula de prueba
    const cedulaPrueba = cedulasPrueba.find(c => c.cedula === cedula);
    if (cedulaPrueba) {
      console.log('✅ Usando cédula de prueba:', cedulaPrueba);
      return of({
        isValid: true,
        data: {
          nombre: cedulaPrueba.nombre,
          apellidos: cedulaPrueba.apellidos,
          cedula: cedulaPrueba.cedula,
          profesion: cedulaPrueba.profesion,
          institucion: cedulaPrueba.institucion,
          fechaExpedicion: '2020-01-01'
        }
      });
    }

    // Consulta real a la SEP
    const searchQuery = `${nombre} ${apellidos} ${cedula}`;
    const url = `https://search.sep.gob.mx/solr/cedulasCore/select?fl=*,score&q=${encodeURIComponent(searchQuery)}&start=0&rows=10&facet=true&indent=on&wt=json`;

    console.log('🔍 Consultando SEP con:', { cedula, nombre, apellidos, url });

    return this.http.jsonp(url, 'json.wrf').pipe(
      map((response: any) => {
        console.log('📡 Respuesta de la SEP:', response);
        
        const docs = response?.response?.docs || [];
        console.log('📄 Documentos encontrados:', docs.length);
        
        if (docs.length === 0) {
          return {
            isValid: false,
            error: 'No se encontró la cédula profesional en el registro de la SEP'
          };
        }

        // Buscar coincidencia exacta de cédula
        const match = docs.find((doc: any) => {
          console.log('Comparando:', doc.cedula, 'con', cedula);
          return doc.cedula?.toLowerCase() === cedula.toLowerCase();
        });

        if (match) {
          console.log('✅ Coincidencia encontrada:', match);
          return {
            isValid: true,
            data: {
              nombre: match.nombre || '',
              apellidos: (match.paterno + ' ' + match.materno).trim() || '',
              cedula: match.cedula,
              profesion: match.titulo || '',
              institucion: match.institucion || '',
              fechaExpedicion: match.fechaExpedicion || ''
            }
          };
        }

        console.log('❌ No se encontró coincidencia exacta');
        return {
          isValid: false,
          error: 'La cédula no coincide con el nombre proporcionado'
        };
      }),
      catchError(error => {
        console.error('❌ Error al verificar cédula:', error);
        return of({
          isValid: false,
          error: 'Error al consultar el servicio de verificación. Intenta más tarde.'
        });
      })
    );
  }

  /**
   * OPCIÓN 2: Usar un servicio de API de pago (Más confiable)
   * Servicios recomendados:
   * - Consulta Única (https://consultaunica.mx/) - Desde $700 MXN por 100 consultas
   * - Verifica ID México (https://verificaid.mx/) - Plan según necesidades
   * - API Market (https://www.apimarket.mx/) - Precios variables
   */
  verificarCedulaAPIPago(cedula: string): Observable<CedulaVerificationResult> {
    // Ejemplo con Consulta Única (necesitas registrarte y obtener tu API key)
    const apiKey = 'TU_API_KEY_AQUI'; // Obtener en consultaunica.mx
    const url = 'https://api.consultaunica.mx/v1/cedula-profesional';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(url, { cedula }, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            isValid: true,
            data: {
              nombre: response.data.nombre,
              apellidos: response.data.apellidos,
              cedula: response.data.cedula,
              profesion: response.data.profesion,
              institucion: response.data.institucion,
              fechaExpedicion: response.data.fecha_expedicion
            }
          };
        }
        return {
          isValid: false,
          error: 'Cédula no encontrada en el registro oficial'
        };
      }),
      catchError(error => {
        return of({
          isValid: false,
          error: 'Error al verificar la cédula'
        });
      })
    );
  }

  /**
   * OPCIÓN 3: Verificación básica en el backend (RECOMENDADO - USAR ESTE)
   * Delegar la verificación a tu propio backend que consulte la SEP
   */
  verificarCedulaBackend(cedula: string, nombre: string, apellidos: string): Observable<CedulaVerificationResult> {
    // Tu backend debe implementar la lógica de consulta
    const url = 'http://localhost:3000/api/verificar-cedula'; // Cambia por tu URL real

    console.log('🔍 Verificando cédula con backend:', { cedula, nombre, apellidos });

    return this.http.post<CedulaVerificationResult>(url, {
      cedula,
      nombre,
      apellidos
    }).pipe(
      map(response => {
        console.log('📡 Respuesta del backend:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error al verificar con backend:', error);
        return of({
          isValid: false,
          error: 'Error al verificar la cédula. Verifica tu conexión.'
        });
      })
    );
  }

  /**
   * OPCIÓN 4: Verificación manual (temporal durante desarrollo)
   * Solo para pruebas - NO usar en producción
   */
  verificarCedulaManual(cedula: string): Observable<CedulaVerificationResult> {
    // Simulación para desarrollo
    // En producción, SIEMPRE usar verificación real
    return of({
      isValid: true,
      data: {
        nombre: 'Demo',
        apellidos: 'Para Desarrollo',
        cedula: cedula,
        profesion: 'Medicina General',
        institucion: 'Universidad Demo'
      }
    });
  }
}