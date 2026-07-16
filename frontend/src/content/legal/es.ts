import type { Section } from "./types";

/**
 * ESPAÑOL (es) — contenido legal — BORRADOR.
 *
 * Este texto es una plantilla y no constituye asesoramiento jurídico. Antes de
 * publicarlo, debe ser revisado por un abogado cualificado y adaptado a su
 * organización. Todos los campos específicos de la empresa son marcadores de
 * posición entre [CORCHETES].
 */

export const lastUpdated = "16 de julio de 2026";

export const draftDisclaimer =
  "BORRADOR — Este texto es una plantilla. Antes de publicarlo, debe ser revisado por un abogado cualificado y adaptado a su organización.";

export const terms: Section[] = [
  {
    heading: "1. Partes y Definiciones",
    paragraphs: [
      "Las presentes Condiciones de Uso (\"Condiciones\") regulan los derechos y obligaciones entre el servicio de software ZeytinSaaS (\"Servicio\"), operado por [ŞİRKET ADI / COMPANY NAME] ([ADRES], [VERGİ NO / VAT]), y la almazara/empresa que se registra en el Servicio (\"Usuario\" o \"Arrendatario\").",
      "\"Proveedor del Servicio\": [ŞİRKET ADI / COMPANY NAME], que presta ZeytinSaaS. \"Datos del Arrendatario\": todos los datos que el Usuario crea, almacena o trata en el Servicio (incluidos los registros de sus propios clientes, producción y contabilidad). \"Usuario Final\": el personal de la almazara que accede en nombre del Usuario.",
      "Al registrarse o utilizar el Servicio, usted declara haber leído, comprendido y aceptado estas Condiciones. Si no las acepta, no debe utilizar el Servicio.",
    ],
  },
  {
    heading: "2. Descripción del Servicio",
    paragraphs: [
      "ZeytinSaaS es una plataforma multiinquilino (multi-tenant) de gestión de relaciones con clientes (CRM) y automatización, diseñada para almazaras de aceite de oliva. El Servicio ofrece registros de pesaje de aceituna, seguimiento de lotes de producción, gestión de clientes y cuentas corrientes, control de existencias/bidones e informes.",
      "El Servicio se presta en la nube \"tal cual\" y \"según disponibilidad\". El Proveedor se reserva el derecho de mejorar, modificar o retirar funcionalidades; se procurará avisar con antelación razonable de los cambios importantes.",
      "El Servicio es únicamente una herramienta de registro y cálculo de datos. No sustituye los resultados de laboratorio oficiales, los tickets de báscula firmados ni los libros legales.",
    ],
  },
  {
    heading: "3. Cuenta y Condiciones de Licencia",
    paragraphs: [
      "El Usuario obtiene, a cambio de una licencia (suscripción) válida, un derecho de uso no exclusivo, intransferible y no sublicenciable. La licencia es válida durante [LİSANS SÜRESİ / p. ej. anual].",
      "Es responsabilidad del Usuario mantener la confidencialidad de las credenciales (nombre de usuario, contraseña). El Usuario es responsable de todas las operaciones realizadas a través de su cuenta. Toda sospecha de acceso no autorizado debe notificarse de inmediato a [E-POSTA].",
      "Al vencer la licencia, podrá suspenderse la introducción de nuevos datos. El Usuario podrá acceder a sus datos históricos en modo solo lectura durante un periodo determinado (p. ej. [X GÜN]). Transcurrido ese plazo, el archivado o la eliminación se rige por la Sección 8.",
    ],
  },
  {
    heading: "4. Uso Aceptable",
    paragraphs: [
      "El Usuario se compromete a utilizar el Servicio únicamente con fines lícitos y conforme a estas Condiciones. El Usuario se abstendrá de realizar ingeniería inversa, eludir las medidas de seguridad, sobrecargar el sistema por medios automatizados o cargar contenidos que vulneren derechos de terceros.",
      "El Usuario es el único responsable de la exactitud de todos los datos que introduce. El Proveedor no responde de cálculos erróneos, diferencias de rendimiento ni conflictos con terceros derivados de una introducción incorrecta de datos (p. ej. peso, acidez, temperatura).",
      "Al introducir datos personales de sus propios clientes (agricultores/productores), el Usuario está obligado a informar a los interesados y a disponer de la base jurídica necesaria (incluido el consentimiento). Respecto de esos datos, el responsable del tratamiento es el Usuario (véase la Política de Privacidad).",
    ],
  },
  {
    heading: "5. Pago y Facturación",
    paragraphs: [
      "El Servicio se presta a cambio de una cuota de licencia anual. Los precios vigentes se establecen en [FİYATLANDIRMA SAYFASI / PRESUPUESTO] y, salvo indicación en contrario, no incluyen los impuestos aplicables (IVA, etc.).",
      "Actualmente los pagos se realizan únicamente mediante transferencia bancaria; no se aceptan pagos en línea (tarjeta) a través del sistema. Las facturas e instrucciones de pago se comunican a través de [E-POSTA]. El pago debe efectuarse dentro del plazo indicado en la factura.",
      "En caso de impago de la cuota a su vencimiento, el Proveedor podrá suspender la cuenta tras un aviso razonable. Los importes pagados por anticipado no se reembolsan, salvo obligación legal.",
    ],
  },
  {
    heading: "6. Datos del Arrendatario y Rol de Encargado del Tratamiento",
    paragraphs: [
      "Todos los Datos del Arrendatario introducidos en el Servicio pertenecen al Usuario. Respecto de esos datos, el Proveedor actúa únicamente como encargado del tratamiento (data processor), siguiendo las instrucciones del Usuario y con el fin de prestar el Servicio.",
      "El Proveedor no utiliza, vende ni comercializa los Datos del Arrendatario para sus propios fines, salvo obligación legal o la propia prestación del Servicio. Los subencargados y las medidas de seguridad se describen en la Política de Privacidad.",
      "El aislamiento de datos entre arrendatarios (tenant isolation) es un principio de seguridad esencial del Servicio: ningún arrendatario puede acceder a los datos de otro.",
    ],
  },
  {
    heading: "7. Limitación de Responsabilidad",
    paragraphs: [
      "El Servicio se presta \"tal cual\" y no se garantiza un funcionamiento ininterrumpido ni libre de errores. En la máxima medida permitida por la ley aplicable, el Proveedor no responde de daños indirectos, incidentales o consecuentes, como el lucro cesante, la pérdida de datos o la interrupción del negocio.",
      "En todo caso, la responsabilidad total del Proveedor se limita a la cuota de licencia abonada por el Usuario en los [12] meses anteriores al hecho que motiva la reclamación.",
      "El Proveedor no responde de hechos ajenos al Servicio, como el almacenamiento físico, fugas de depósitos, robo, catástrofes naturales o mermas, ni de interrupciones derivadas de infraestructuras de terceros (alojamiento, internet).",
    ],
  },
  {
    heading: "8. Resolución y Suspensión",
    paragraphs: [
      "Cualquiera de las partes podrá resolver el contrato mediante notificación escrita con [FESİH BİLDİRİM SÜRESİ] de antelación. El Proveedor podrá suspender o resolver la cuenta en caso de incumplimiento esencial de estas Condiciones o de mora en el pago.",
      "En caso de resolución, el Usuario dispondrá de un plazo razonable (p. ej. [X GÜN]) para exportar sus Datos del Arrendatario. Transcurrido dicho plazo, el Proveedor podrá eliminar o archivar los datos, sin perjuicio de las obligaciones legales de conservación.",
      "Las cláusulas que por su naturaleza deban subsistir tras la resolución (pago, límite de responsabilidad, propiedad intelectual, ley aplicable) seguirán vigentes.",
    ],
  },
  {
    heading: "9. Propiedad Intelectual",
    paragraphs: [
      "Los derechos de propiedad intelectual sobre el software ZeytinSaaS, su código fuente, diseño, marcas y todo su contenido corresponden al Proveedor o a sus licenciantes. Estas Condiciones no transfieren ningún derecho más allá del uso del Servicio.",
      "El Usuario no podrá copiar, reproducir, arrendar, vender ni crear obras derivadas del Servicio. Los derechos sobre los Datos del Arrendatario permanecen en el Usuario.",
    ],
  },
  {
    heading: "10. Ley Aplicable y Jurisdicción",
    paragraphs: [
      "Estas Condiciones se interpretan y aplican conforme a [UYGULANACAK HUKUK / LEY APLICABLE]. Si el Usuario reside en la Unión Europea, quedan a salvo las disposiciones imperativas de la normativa de protección de los consumidores.",
      "Para cualquier controversia derivada de estas Condiciones serán competentes [YETKİLİ MAHKEME/TAHKİM / los tribunales de [ŞEHİR/ÜLKE]]. Esta cláusula no limita el derecho de los consumidores a acudir a los tribunales de su lugar de residencia.",
    ],
  },
  {
    heading: "11. Modificación de las Condiciones",
    paragraphs: [
      "El Proveedor podrá actualizar estas Condiciones periódicamente. Los cambios esenciales se comunicarán con antelación razonable dentro del Servicio o a través de [E-POSTA].",
      "El uso continuado del Servicio tras la entrada en vigor de los cambios implica su aceptación. El Usuario que no los acepte podrá resolver el contrato conforme a la Sección 8.",
    ],
  },
  {
    heading: "12. Contacto",
    paragraphs: [
      "Para cualquier consulta sobre estas Condiciones: [ŞİRKET ADI / COMPANY NAME], [ADRES], correo electrónico: [E-POSTA].",
    ],
  },
];

export const privacy: Section[] = [
  {
    heading: "1. Identidad del Responsable del Tratamiento",
    paragraphs: [
      "La presente Política de Privacidad se ha elaborado conforme al Reglamento General de Protección de Datos de la Unión Europea (\"RGPD\") y, en su caso, a la normativa turca de protección de datos (\"KVKK\"). ZeytinSaaS se presta en varias regiones (Turquía y la UE).",
      "Respecto de los datos de las cuentas de la almazara (los datos de cuenta de los propios usuarios de la almazara), el responsable del tratamiento (RGPD) / responsable de datos (KVKK) es: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES], [E-POSTA], [VERGİ NO / VAT].",
      "DISTINCIÓN IMPORTANTE: respecto de los datos de los propios clientes de la almazara (agricultores/productores), el responsable del tratamiento es el Arrendatario; ZeytinSaaS actúa únicamente como encargado del tratamiento (data processor). Esta distinción se explica en las Secciones 2 y 3.",
    ],
  },
  {
    heading: "2. Categorías de Datos Personales Tratados",
    paragraphs: [
      "A) Cuentas de usuario de la almazara (ZeytinSaaS es responsable): nombre y apellidos, dirección de correo electrónico, número de teléfono; datos de cuenta y de sesión; registros de operaciones/auditoría (logs); datos técnicos como la dirección IP y datos del navegador.",
      "B) Datos de los propios clientes del Arrendatario (ZeytinSaaS es encargado): nombre y apellidos del agricultor/productor, número de teléfono, número de identificación nacional (TCKN en Turquía / documento equivalente en la UE), saldos de cuenta corriente y registros financieros, registros de producción/pesaje. El Arrendatario introduce estos datos y es responsable de su base jurídica.",
      "El Proveedor trata los datos del grupo (B) únicamente para prestar el Servicio y cumplir las instrucciones del Arrendatario.",
    ],
  },
  {
    heading: "3. Nota Especial sobre el Número de Identificación Nacional y los Datos Sensibles",
    paragraphs: [
      "El número de identificación nacional (en Turquía, el TCKN) es un dato identificativo especialmente relevante que exige proporcionalidad y medidas de seguridad adicionales. Solo debe tratarse cuando sea necesario para las obligaciones legales o contables del Arrendatario.",
      "Antes de introducir datos como el número de identificación nacional, el Arrendatario está obligado a informar a los interesados (agricultores) y a disponer de la base jurídica necesaria. El Proveedor protege estos datos mediante restricciones de acceso, autorización y cifrado; no obstante, la responsabilidad jurídica sobre la recogida corresponde al Arrendatario.",
      "En el RGPD, el número de identificación nacional no es una \"categoría especial de datos\", pero requiere protección reforzada; no deben tratarse en el Servicio datos de categorías especiales (salud, biometría, etc.).",
    ],
  },
  {
    heading: "4. Finalidades del Tratamiento",
    paragraphs: [
      "Creación de la cuenta de usuario de la almazara, autenticación y autorización; prestación, mantenimiento y mejora del Servicio; atención de solicitudes de soporte; facturación y cobro; garantía de la seguridad y prevención de abusos; cumplimiento de obligaciones legales.",
      "Respecto de los Datos del Arrendatario, la finalidad se limita a los fines definidos por el Arrendatario (gestión de producción/clientes/cuentas); el Proveedor no los utiliza con fines propios de marketing o elaboración de perfiles.",
    ],
  },
  {
    heading: "5. Bases Jurídicas del Tratamiento",
    paragraphs: [
      "Ejecución de un contrato (RGPD art. 6.1.b): creación de la cuenta, prestación del Servicio y facturación.",
      "Interés legítimo (RGPD art. 6.1.f): seguridad, prevención del fraude y mejora del Servicio, respetando los derechos y libertades fundamentales del interesado.",
      "Obligación legal (RGPD art. 6.1.c): obligaciones fiscales, contables y comunicaciones a organismos oficiales. Cuando proceda, se recabará el consentimiento (RGPD art. 6.1.a), que podrá retirarse en cualquier momento.",
    ],
  },
  {
    heading: "6. Destinatarios y Subencargados (Sub-processors)",
    paragraphs: [
      "Los datos personales podrán comunicarse, limitados a su finalidad, a subencargados como el proveedor de alojamiento en la nube [BARINDIRMA SAĞLAYICISI], el proveedor de correo/notificaciones [E-POSTA SAĞLAYICISI] y, en su caso, el proveedor de SMS [SMS SAĞLAYICISI]. Los subencargados están vinculados por contratos de tratamiento de datos.",
      "Cuando exista obligación legal, los datos podrán comunicarse a las autoridades públicas competentes (p. ej. administraciones tributarias). El Proveedor no vende ni cede los Datos del Arrendatario a terceros con fines de marketing.",
      "La lista actualizada de subencargados puede solicitarse en [E-POSTA].",
    ],
  },
  {
    heading: "7. Transferencias Internacionales",
    paragraphs: [
      "Dado que el Servicio se presta en varias regiones, los datos personales se alojan en [VERİ MERKEZİ BÖLGESİ / p. ej. la UE o Turquía]. Cuando sea necesario transferir datos fuera de dicha región, se aplicarán las garantías adecuadas conforme al Capítulo V del RGPD (decisión de adecuación, Cláusulas Contractuales Tipo/CCT o consentimiento explícito).",
      "A las transferencias desde la UE se aplican las normas de transferencia internacional del RGPD; a las transferencias desde Turquía, el régimen de la KVKK.",
    ],
  },
  {
    heading: "8. Plazos de Conservación",
    paragraphs: [
      "Los datos personales se conservan durante el tiempo necesario para la finalidad del tratamiento y durante los plazos legales de conservación previstos por la normativa aplicable (p. ej. en materia fiscal/mercantil, [SAKLAMA SÜRESİ]).",
      "Cuando desaparezca la finalidad o venza el plazo legal, los datos personales se suprimen, destruyen o anonimizan. Respecto de los Datos del Arrendatario, las instrucciones de conservación y supresión las define el Arrendatario.",
    ],
  },
  {
    heading: "9. Derechos del Interesado",
    paragraphs: [
      "Conforme a los artículos 15 a 22 del RGPD, usted tiene derecho a acceder a sus datos personales, a su rectificación, a su supresión (\"derecho al olvido\"), a la limitación del tratamiento, a la portabilidad de los datos y a oponerse al tratamiento. En el tratamiento basado en el consentimiento, puede retirarlo en cualquier momento.",
      "Para ejercer estos derechos puede dirigirse a [DPO E-POSTA] o [E-POSTA]. Sus solicitudes se resolverán, previa verificación de identidad, en el plazo máximo de un mes conforme al RGPD.",
      "Asimismo, tiene derecho a presentar una reclamación ante la autoridad de control: en España, la Agencia Española de Protección de Datos (AEPD); en otros Estados miembros de la UE, la autoridad de protección de datos competente de su lugar de residencia; en Turquía, la Autoridad de Protección de Datos Personales (KVKK).",
    ],
  },
  {
    heading: "10. Cookies y Almacenamiento Local (localStorage)",
    paragraphs: [
      "La aplicación utiliza el almacenamiento local (localStorage) de su navegador para la gestión de sesiones y la autenticación; se trata de un almacenamiento técnico imprescindible para el funcionamiento del Servicio. Además, para el trabajo sin conexión (offline) se conserva localmente una cola de operaciones pendientes (offline queue).",
      "Este almacenamiento local no tiene finalidad de marketing ni de seguimiento (tracking). Si borra los datos del navegador, se cerrará su sesión y podría perder los registros offline no sincronizados.",
      "No se utilizan cookies publicitarias ni de seguimiento de terceros. En caso de utilizarse, esta política se actualizará y se implementarán los mecanismos de consentimiento necesarios.",
    ],
  },
  {
    heading: "11. Medidas de Seguridad",
    paragraphs: [
      "El Proveedor aplica medidas técnicas y organizativas como el cifrado en tránsito (TLS), el control de acceso y la autorización basada en roles, el aislamiento de datos entre arrendatarios, los registros de auditoría y las copias de seguridad periódicas.",
      "Ningún método de transmisión por internet es 100 % seguro; no puede garantizarse una seguridad absoluta. El Usuario está obligado a utilizar contraseñas robustas y a mantener en secreto sus credenciales.",
    ],
  },
  {
    heading: "12. Modificación de la Política",
    paragraphs: [
      "Esta Política de Privacidad puede actualizarse periódicamente. Los cambios esenciales se anunciarán dentro del Servicio o a través de [E-POSTA]. La fecha de \"última actualización\" en la parte superior indica la versión vigente.",
    ],
  },
  {
    heading: "13. Contacto",
    paragraphs: [
      "Responsable del tratamiento: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES]. Delegado de Protección de Datos (DPO): [DPO E-POSTA]. Contacto general: [E-POSTA]. Ubicación: [ŞEHİR/ÜLKE].",
    ],
  },
];
