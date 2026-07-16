import type { Section } from "./types";

/**
 * ITALIANO (it) — contenuto legale — BOZZA.
 *
 * Questo testo è un modello e non costituisce consulenza legale. Prima della
 * pubblicazione deve essere esaminato da un avvocato qualificato e adattato
 * alla vostra organizzazione. Tutti i campi specifici dell'azienda sono
 * segnaposto tra [PARENTESI QUADRE].
 */

export const lastUpdated = "16 luglio 2026";

export const draftDisclaimer =
  "BOZZA — Questo testo è un modello. Prima della pubblicazione deve essere esaminato da un avvocato qualificato e adattato alla vostra organizzazione.";

export const terms: Section[] = [
  {
    heading: "1. Parti e Definizioni",
    paragraphs: [
      "Le presenti Condizioni d'Uso (\"Condizioni\") disciplinano i diritti e gli obblighi tra il servizio software ZeytinSaaS (\"Servizio\"), gestito da [ŞİRKET ADI / COMPANY NAME] ([ADRES], [VERGİ NO / VAT]), e il frantoio/impresa che si registra al Servizio (\"Utente\" o \"Tenant\").",
      "\"Fornitore del Servizio\": [ŞİRKET ADI / COMPANY NAME], che eroga ZeytinSaaS. \"Dati del Tenant\": tutti i dati che l'Utente crea, conserva o tratta nel Servizio (compresi i registri dei propri clienti, della produzione e della contabilità). \"Utente Finale\": il personale del frantoio che accede per conto dell'Utente.",
      "Registrandosi o utilizzando il Servizio, l'Utente dichiara di aver letto, compreso e accettato le presenti Condizioni. In caso di mancata accettazione, non deve utilizzare il Servizio.",
    ],
  },
  {
    heading: "2. Descrizione del Servizio",
    paragraphs: [
      "ZeytinSaaS è una piattaforma multi-tenant di gestione delle relazioni con i clienti (CRM) e di automazione, progettata per i frantoi oleari. Il Servizio offre registrazioni di pesatura delle olive, tracciamento dei lotti di produzione, gestione dei clienti e dei conti correnti, controllo delle scorte/latte e reportistica.",
      "Il Servizio è erogato in cloud \"così com'è\" e \"secondo disponibilità\". Il Fornitore si riserva il diritto di migliorare, modificare o rimuovere funzionalità; si cercherà di dare un preavviso ragionevole delle modifiche rilevanti.",
      "Il Servizio è unicamente uno strumento di registrazione e calcolo dei dati. Non sostituisce i risultati di laboratorio ufficiali, i tagliandi di pesa firmati né i libri contabili obbligatori.",
    ],
  },
  {
    heading: "3. Account e Condizioni di Licenza",
    paragraphs: [
      "L'Utente ottiene, a fronte di una licenza (abbonamento) valida, un diritto d'uso non esclusivo, non trasferibile e non sublicenziabile. La licenza è valida per [LİSANS SÜRESİ / es. annuale].",
      "È responsabilità dell'Utente mantenere riservate le credenziali (nome utente, password). L'Utente è responsabile di tutte le operazioni effettuate tramite il proprio account. Ogni sospetto di accesso non autorizzato deve essere segnalato immediatamente a [E-POSTA].",
      "Alla scadenza della licenza, l'inserimento di nuovi dati può essere sospeso. L'Utente può accedere ai dati storici in sola lettura per un periodo determinato (es. [X GÜN]). Trascorso tale termine, l'archiviazione o la cancellazione è disciplinata dalla Sezione 8.",
    ],
  },
  {
    heading: "4. Uso Accettabile",
    paragraphs: [
      "L'Utente si impegna a utilizzare il Servizio esclusivamente per finalità lecite e in conformità alle presenti Condizioni. L'Utente si astiene dal decompilare il Servizio, aggirare le misure di sicurezza, sovraccaricare il sistema con mezzi automatizzati o caricare contenuti che violino i diritti di terzi.",
      "L'Utente è l'unico responsabile dell'esattezza di tutti i dati inseriti. Il Fornitore non risponde di calcoli errati, differenze di resa o controversie con terzi derivanti da un inserimento errato dei dati (es. peso, acidità, temperatura).",
      "Inserendo i dati personali dei propri clienti (agricoltori/produttori), l'Utente è tenuto a informare gli interessati e a disporre della base giuridica necessaria (compreso il consenso). Rispetto a tali dati, il titolare del trattamento è l'Utente (v. Informativa sulla Privacy).",
    ],
  },
  {
    heading: "5. Pagamento e Fatturazione",
    paragraphs: [
      "Il Servizio è erogato a fronte di un canone di licenza annuale. I prezzi vigenti sono stabiliti in [FİYATLANDIRMA SAYFASI / PREVENTIVO] e, salvo diversa indicazione, non includono le imposte applicabili (IVA, ecc.).",
      "Attualmente i pagamenti avvengono unicamente tramite bonifico bancario; non sono accettati pagamenti online (carta) tramite il sistema. Le fatture e le istruzioni di pagamento sono comunicate tramite [E-POSTA]. Il pagamento deve essere effettuato entro il termine indicato in fattura.",
      "In caso di mancato pagamento del canone alla scadenza, il Fornitore può sospendere l'account previo ragionevole preavviso. Gli importi pagati in anticipo non sono rimborsabili, salvo obbligo di legge.",
    ],
  },
  {
    heading: "6. Dati del Tenant e Ruolo di Responsabile del Trattamento",
    paragraphs: [
      "Tutti i Dati del Tenant inseriti nel Servizio appartengono all'Utente. Rispetto a tali dati, il Fornitore agisce unicamente in qualità di responsabile del trattamento (data processor), su istruzione dell'Utente e al fine di erogare il Servizio.",
      "Il Fornitore non utilizza, vende né commercializza i Dati del Tenant per finalità proprie, salvo obblighi di legge o l'erogazione stessa del Servizio. I sub-responsabili e le misure di sicurezza sono descritti nell'Informativa sulla Privacy.",
      "L'isolamento dei dati tra tenant (tenant isolation) è un principio di sicurezza essenziale del Servizio: nessun tenant può accedere ai dati di un altro.",
    ],
  },
  {
    heading: "7. Limitazione di Responsabilità",
    paragraphs: [
      "Il Servizio è erogato \"così com'è\" e non se ne garantisce un funzionamento ininterrotto o privo di errori. Nella misura massima consentita dalla legge applicabile, il Fornitore non risponde di danni indiretti, incidentali o consequenziali, quali mancato guadagno, perdita di dati o interruzione dell'attività.",
      "In ogni caso, la responsabilità complessiva del Fornitore è limitata al canone di licenza corrisposto dall'Utente nei [12] mesi precedenti l'evento all'origine della richiesta.",
      "Il Fornitore non risponde di eventi estranei al Servizio, quali stoccaggio fisico, perdite dei serbatoi, furto, calamità naturali o cali di peso, né di interruzioni riconducibili a infrastrutture di terzi (hosting, internet).",
    ],
  },
  {
    heading: "8. Risoluzione e Sospensione",
    paragraphs: [
      "Ciascuna parte può risolvere il contratto con comunicazione scritta con [FESİH BİLDİRİM SÜRESİ] di preavviso. Il Fornitore può sospendere o risolvere l'account in caso di violazione essenziale delle presenti Condizioni o di mora nel pagamento.",
      "In caso di risoluzione, l'Utente dispone di un termine ragionevole (es. [X GÜN]) per esportare i propri Dati del Tenant. Decorso tale termine, il Fornitore può cancellare o archiviare i dati, fatti salvi gli obblighi legali di conservazione.",
      "Le clausole che per loro natura devono sopravvivere alla risoluzione (pagamento, limite di responsabilità, proprietà intellettuale, legge applicabile) restano efficaci.",
    ],
  },
  {
    heading: "9. Proprietà Intellettuale",
    paragraphs: [
      "I diritti di proprietà intellettuale sul software ZeytinSaaS, sul codice sorgente, sul design, sui marchi e su tutti i contenuti spettano al Fornitore o ai suoi licenzianti. Le presenti Condizioni non trasferiscono alcun diritto oltre all'uso del Servizio.",
      "L'Utente non può copiare, riprodurre, noleggiare, vendere né creare opere derivate dal Servizio. I diritti sui Dati del Tenant restano in capo all'Utente.",
    ],
  },
  {
    heading: "10. Legge Applicabile e Foro Competente",
    paragraphs: [
      "Le presenti Condizioni sono interpretate e applicate secondo [UYGULANACAK HUKUK / LEGGE APPLICABILE]. Se l'Utente risiede nell'Unione Europea, restano salve le disposizioni imperative della normativa a tutela dei consumatori.",
      "Per ogni controversia derivante dalle presenti Condizioni è competente [YETKİLİ MAHKEME/TAHKİM / il foro di [ŞEHİR/ÜLKE]]. Tale clausola non limita il diritto dei consumatori di adire il giudice del proprio luogo di residenza.",
    ],
  },
  {
    heading: "11. Modifica delle Condizioni",
    paragraphs: [
      "Il Fornitore può aggiornare periodicamente le presenti Condizioni. Le modifiche essenziali sono comunicate con ragionevole preavviso all'interno del Servizio o tramite [E-POSTA].",
      "L'uso continuato del Servizio dopo l'entrata in vigore delle modifiche ne comporta l'accettazione. L'Utente che non le accetti può risolvere il contratto ai sensi della Sezione 8.",
    ],
  },
  {
    heading: "12. Contatti",
    paragraphs: [
      "Per qualsiasi domanda sulle presenti Condizioni: [ŞİRKET ADI / COMPANY NAME], [ADRES], e-mail: [E-POSTA].",
    ],
  },
];

export const privacy: Section[] = [
  {
    heading: "1. Identità del Titolare del Trattamento",
    paragraphs: [
      "La presente Informativa sulla Privacy è redatta in conformità al Regolamento Generale sulla Protezione dei Dati dell'Unione Europea (\"GDPR\") e, ove applicabile, alla normativa turca sulla protezione dei dati (\"KVKK\"). ZeytinSaaS è erogato in più regioni (Turchia e UE).",
      "Rispetto ai dati degli account del frantoio (i dati di account dei suoi utenti), il titolare del trattamento (GDPR) / responsabile dei dati (KVKK) è: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES], [E-POSTA], [VERGİ NO / VAT].",
      "DISTINZIONE IMPORTANTE: rispetto ai dati dei clienti propri del frantoio (agricoltori/produttori), il titolare del trattamento è il Tenant; ZeytinSaaS agisce unicamente come responsabile del trattamento (data processor). Tale distinzione è illustrata nelle Sezioni 2 e 3.",
    ],
  },
  {
    heading: "2. Categorie di Dati Personali Trattati",
    paragraphs: [
      "A) Account utente del frantoio (ZeytinSaaS è titolare): nome e cognome, indirizzo e-mail, numero di telefono; dati di account e di sessione; registri delle operazioni/audit (log); dati tecnici quali indirizzo IP e dati del browser.",
      "B) Dati dei clienti propri del Tenant (ZeytinSaaS è responsabile): nome e cognome dell'agricoltore/produttore, numero di telefono, numero di identificazione nazionale (TCKN in Turchia / documento equivalente nell'UE), saldi di conto corrente e registri finanziari, registri di produzione/pesatura. Il Tenant inserisce tali dati ed è responsabile della relativa base giuridica.",
      "Il Fornitore tratta i dati del gruppo (B) unicamente per erogare il Servizio e per adempiere alle istruzioni del Tenant.",
    ],
  },
  {
    heading: "3. Nota Specifica sul Numero di Identificazione Nazionale e sui Dati Sensibili",
    paragraphs: [
      "Il numero di identificazione nazionale (in Turchia il TCKN) è un dato identificativo di particolare rilievo che richiede proporzionalità e misure di sicurezza aggiuntive. Deve essere trattato solo quando necessario per gli obblighi legali o contabili del Tenant.",
      "Prima di inserire dati come il numero di identificazione nazionale, il Tenant è tenuto a informare gli interessati (agricoltori) e a disporre della base giuridica necessaria. Il Fornitore protegge tali dati mediante restrizioni di accesso, autorizzazione e cifratura; tuttavia, la responsabilità giuridica sulla raccolta spetta al Tenant.",
      "Nel GDPR il numero di identificazione nazionale non rientra tra le \"categorie particolari di dati\", ma richiede una protezione rafforzata; nel Servizio non devono essere trattati dati appartenenti a categorie particolari (salute, biometria, ecc.).",
    ],
  },
  {
    heading: "4. Finalità del Trattamento",
    paragraphs: [
      "Creazione dell'account utente del frantoio, autenticazione e autorizzazione; erogazione, manutenzione e miglioramento del Servizio; gestione delle richieste di assistenza; fatturazione e incasso; garanzia della sicurezza e prevenzione degli abusi; adempimento degli obblighi di legge.",
      "Rispetto ai Dati del Tenant, la finalità è limitata agli scopi definiti dal Tenant (gestione della produzione/dei clienti/dei conti); il Fornitore non li utilizza per finalità proprie di marketing o profilazione.",
    ],
  },
  {
    heading: "5. Basi Giuridiche del Trattamento",
    paragraphs: [
      "Esecuzione di un contratto (GDPR art. 6.1.b): creazione dell'account, erogazione del Servizio e fatturazione.",
      "Legittimo interesse (GDPR art. 6.1.f): sicurezza, prevenzione delle frodi e miglioramento del Servizio, nel rispetto dei diritti e delle libertà fondamentali dell'interessato.",
      "Obbligo legale (GDPR art. 6.1.c): obblighi fiscali, contabili e comunicazioni alle autorità. Ove necessario, viene richiesto il consenso (GDPR art. 6.1.a), revocabile in qualsiasi momento.",
    ],
  },
  {
    heading: "6. Destinatari e Sub-responsabili (Sub-processors)",
    paragraphs: [
      "I dati personali possono essere comunicati, nei limiti della finalità, a sub-responsabili quali il fornitore di hosting cloud [BARINDIRMA SAĞLAYICISI], il fornitore di e-mail/notifiche [E-POSTA SAĞLAYICISI] e, ove presente, il fornitore di SMS [SMS SAĞLAYICISI]. I sub-responsabili sono vincolati da contratti sul trattamento dei dati.",
      "In caso di obbligo di legge, i dati possono essere comunicati alle autorità pubbliche competenti (es. amministrazioni fiscali). Il Fornitore non vende né cede i Dati del Tenant a terzi per finalità di marketing.",
      "L'elenco aggiornato dei sub-responsabili può essere richiesto a [E-POSTA].",
    ],
  },
  {
    heading: "7. Trasferimenti Internazionali",
    paragraphs: [
      "Poiché il Servizio è erogato in più regioni, i dati personali sono ospitati in [VERİ MERKEZİ BÖLGESİ / es. UE o Turchia]. Quando è necessario trasferire dati al di fuori di tale regione, si applicano garanzie adeguate ai sensi del Capo V del GDPR (decisione di adeguatezza, Clausole Contrattuali Standard/SCC o consenso esplicito).",
      "Ai trasferimenti dall'UE si applicano le norme del GDPR sul trasferimento internazionale; ai trasferimenti dalla Turchia, il regime della KVKK.",
    ],
  },
  {
    heading: "8. Periodi di Conservazione",
    paragraphs: [
      "I dati personali sono conservati per il tempo necessario alla finalità del trattamento e per i termini legali di conservazione previsti dalla normativa applicabile (es. in materia fiscale/commerciale, [SAKLAMA SÜRESİ]).",
      "Al venir meno della finalità o alla scadenza del termine legale, i dati personali sono cancellati, distrutti o anonimizzati. Rispetto ai Dati del Tenant, le istruzioni di conservazione e cancellazione sono definite dal Tenant.",
    ],
  },
  {
    heading: "9. Diritti dell'Interessato",
    paragraphs: [
      "Ai sensi degli articoli da 15 a 22 del GDPR, avete il diritto di accedere ai vostri dati personali, di ottenerne la rettifica, la cancellazione (\"diritto all'oblio\"), la limitazione del trattamento, la portabilità dei dati e di opporvi al trattamento. Nel trattamento basato sul consenso, potete revocarlo in qualsiasi momento.",
      "Per esercitare tali diritti potete rivolgervi a [DPO E-POSTA] o [E-POSTA]. Le vostre richieste saranno evase, previa verifica dell'identità, entro il termine massimo di un mese ai sensi del GDPR.",
      "Avete inoltre il diritto di proporre reclamo all'autorità di controllo: in Italia, il Garante per la protezione dei dati personali (Garante); negli altri Stati membri dell'UE, l'autorità competente del vostro luogo di residenza; in Turchia, l'Autorità per la protezione dei dati personali (KVKK).",
    ],
  },
  {
    heading: "10. Cookie e Archiviazione Locale (localStorage)",
    paragraphs: [
      "L'applicazione utilizza l'archiviazione locale (localStorage) del browser per la gestione delle sessioni e l'autenticazione; si tratta di un'archiviazione tecnica indispensabile al funzionamento del Servizio. Inoltre, per il lavoro offline viene conservata localmente una coda di operazioni in sospeso (offline queue).",
      "Questa archiviazione locale non ha finalità di marketing né di tracciamento (tracking). La cancellazione dei dati del browser comporta la disconnessione e la possibile perdita dei record offline non sincronizzati.",
      "Non sono utilizzati cookie pubblicitari o di tracciamento di terzi. In caso di utilizzo, la presente informativa sarà aggiornata e saranno predisposti i necessari meccanismi di consenso.",
    ],
  },
  {
    heading: "11. Misure di Sicurezza",
    paragraphs: [
      "Il Fornitore applica misure tecniche e organizzative quali la cifratura in transito (TLS), il controllo degli accessi e l'autorizzazione basata sui ruoli, l'isolamento dei dati tra tenant, i registri di audit e i backup periodici.",
      "Nessun metodo di trasmissione via internet è sicuro al 100%; non può essere garantita una sicurezza assoluta. L'Utente è tenuto a utilizzare password robuste e a mantenere riservate le proprie credenziali.",
    ],
  },
  {
    heading: "12. Modifica dell'Informativa",
    paragraphs: [
      "La presente Informativa sulla Privacy può essere aggiornata periodicamente. Le modifiche essenziali sono comunicate all'interno del Servizio o tramite [E-POSTA]. La data di \"ultimo aggiornamento\" in alto indica la versione vigente.",
    ],
  },
  {
    heading: "13. Contatti",
    paragraphs: [
      "Titolare del trattamento: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES]. Responsabile della protezione dei dati (DPO): [DPO E-POSTA]. Contatto generale: [E-POSTA]. Ubicazione: [ŞEHİR/ÜLKE].",
    ],
  },
];
