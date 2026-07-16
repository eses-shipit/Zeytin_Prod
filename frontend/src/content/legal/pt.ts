import type { Section } from "./types";

/**
 * PORTUGUÊS (pt) — conteúdo jurídico — RASCUNHO.
 *
 * Este texto é um modelo e não constitui aconselhamento jurídico. Antes de ser
 * publicado, deve ser revisto por um advogado qualificado e adaptado à sua
 * organização. Todos os campos específicos da empresa são marcadores de
 * posição entre [PARÊNTESES RETOS].
 */

export const lastUpdated = "16 de julho de 2026";

export const draftDisclaimer =
  "RASCUNHO — Este texto é um modelo. Antes de ser publicado, deve ser revisto por um advogado qualificado e adaptado à sua organização.";

export const terms: Section[] = [
  {
    heading: "1. Partes e Definições",
    paragraphs: [
      "As presentes Condições de Utilização (\"Condições\") regulam os direitos e obrigações entre o serviço de software ZeytinSaaS (\"Serviço\"), explorado por [ŞİRKET ADI / COMPANY NAME] ([ADRES], [VERGİ NO / VAT]), e o lagar/empresa que se regista no Serviço (\"Utilizador\" ou \"Inquilino\").",
      "\"Prestador do Serviço\": [ŞİRKET ADI / COMPANY NAME], que disponibiliza o ZeytinSaaS. \"Dados do Inquilino\": todos os dados que o Utilizador cria, armazena ou trata no Serviço (incluindo os registos dos seus próprios clientes, da produção e da contabilidade). \"Utilizador Final\": o pessoal do lagar que acede em nome do Utilizador.",
      "Ao registar-se ou utilizar o Serviço, o Utilizador declara ter lido, compreendido e aceite as presentes Condições. Caso não as aceite, não deve utilizar o Serviço.",
    ],
  },
  {
    heading: "2. Descrição do Serviço",
    paragraphs: [
      "O ZeytinSaaS é uma plataforma multi-inquilino (multi-tenant) de gestão da relação com clientes (CRM) e de automação, concebida para lagares de azeite. O Serviço oferece registos de pesagem de azeitona, rastreio de lotes de produção, gestão de clientes e de contas correntes, controlo de existências/bidões e relatórios.",
      "O Serviço é prestado na nuvem \"tal como está\" e \"consoante a disponibilidade\". O Prestador reserva-se o direito de melhorar, alterar ou remover funcionalidades; procurará avisar com antecedência razoável sobre alterações relevantes.",
      "O Serviço é apenas uma ferramenta de registo e cálculo de dados. Não substitui os resultados laboratoriais oficiais, os talões de báscula assinados nem os livros contabilísticos obrigatórios.",
    ],
  },
  {
    heading: "3. Conta e Condições de Licença",
    paragraphs: [
      "O Utilizador obtém, mediante uma licença (subscrição) válida, um direito de utilização não exclusivo, intransmissível e não sublicenciável. A licença é válida durante [LİSANS SÜRESİ / p. ex. anual].",
      "É da responsabilidade do Utilizador manter a confidencialidade das credenciais (nome de utilizador, palavra-passe). O Utilizador é responsável por todas as operações realizadas através da sua conta. Qualquer suspeita de acesso não autorizado deve ser comunicada de imediato para [E-POSTA].",
      "Ao expirar a licença, a introdução de novos dados pode ser suspensa. O Utilizador poderá aceder aos dados históricos em modo apenas de leitura durante um período determinado (p. ex. [X GÜN]). Findo esse prazo, o arquivamento ou a eliminação rege-se pela Secção 8.",
    ],
  },
  {
    heading: "4. Utilização Aceitável",
    paragraphs: [
      "O Utilizador compromete-se a utilizar o Serviço apenas para fins lícitos e em conformidade com as presentes Condições. O Utilizador abster-se-á de fazer engenharia inversa, contornar as medidas de segurança, sobrecarregar o sistema por meios automatizados ou carregar conteúdos que violem direitos de terceiros.",
      "O Utilizador é o único responsável pela exatidão de todos os dados que introduz. O Prestador não responde por cálculos incorretos, diferenças de rendimento ou litígios com terceiros decorrentes de uma introdução incorreta de dados (p. ex. peso, acidez, temperatura).",
      "Ao introduzir dados pessoais dos seus próprios clientes (agricultores/produtores), o Utilizador é obrigado a informar os titulares e a dispor da base jurídica necessária (incluindo o consentimento). Relativamente a esses dados, o responsável pelo tratamento é o Utilizador (ver Política de Privacidade).",
    ],
  },
  {
    heading: "5. Pagamento e Faturação",
    paragraphs: [
      "O Serviço é prestado mediante uma taxa de licença anual. Os preços em vigor são definidos em [FİYATLANDIRMA SAYFASI / ORÇAMENTO] e, salvo indicação em contrário, não incluem os impostos aplicáveis (IVA, etc.).",
      "Atualmente os pagamentos são efetuados apenas por transferência bancária; não são aceites pagamentos online (cartão) através do sistema. As faturas e instruções de pagamento são comunicadas através de [E-POSTA]. O pagamento deve ser efetuado dentro do prazo indicado na fatura.",
      "Em caso de não pagamento da taxa no vencimento, o Prestador pode suspender a conta após aviso razoável. Os montantes pagos antecipadamente não são reembolsáveis, salvo obrigação legal.",
    ],
  },
  {
    heading: "6. Dados do Inquilino e Papel de Subcontratante",
    paragraphs: [
      "Todos os Dados do Inquilino introduzidos no Serviço pertencem ao Utilizador. Relativamente a esses dados, o Prestador atua unicamente na qualidade de subcontratante (data processor), seguindo as instruções do Utilizador e com a finalidade de prestar o Serviço.",
      "O Prestador não utiliza, vende nem comercializa os Dados do Inquilino para fins próprios, salvo obrigação legal ou a própria prestação do Serviço. Os subcontratantes ulteriores e as medidas de segurança encontram-se descritos na Política de Privacidade.",
      "O isolamento de dados entre inquilinos (tenant isolation) é um princípio de segurança essencial do Serviço: nenhum inquilino pode aceder aos dados de outro.",
    ],
  },
  {
    heading: "7. Limitação de Responsabilidade",
    paragraphs: [
      "O Serviço é prestado \"tal como está\" e não se garante um funcionamento ininterrupto ou isento de erros. Na medida máxima permitida pela lei aplicável, o Prestador não responde por danos indiretos, incidentais ou consequenciais, como lucros cessantes, perda de dados ou interrupção da atividade.",
      "Em qualquer caso, a responsabilidade total do Prestador está limitada à taxa de licença paga pelo Utilizador nos [12] meses anteriores ao facto que dá origem ao pedido.",
      "O Prestador não responde por factos alheios ao Serviço, como o armazenamento físico, fugas nos depósitos, roubo, catástrofes naturais ou quebras, nem por interrupções decorrentes de infraestruturas de terceiros (alojamento, internet).",
    ],
  },
  {
    heading: "8. Resolução e Suspensão",
    paragraphs: [
      "Qualquer das partes pode resolver o contrato mediante comunicação escrita com [FESİH BİLDİRİM SÜRESİ] de antecedência. O Prestador pode suspender ou resolver a conta em caso de incumprimento essencial das presentes Condições ou de mora no pagamento.",
      "Em caso de resolução, o Utilizador dispõe de um prazo razoável (p. ex. [X GÜN]) para exportar os seus Dados do Inquilino. Findo esse prazo, o Prestador pode eliminar ou arquivar os dados, sem prejuízo das obrigações legais de conservação.",
      "As cláusulas que, pela sua natureza, devam subsistir após a resolução (pagamento, limite de responsabilidade, propriedade intelectual, lei aplicável) mantêm-se em vigor.",
    ],
  },
  {
    heading: "9. Propriedade Intelectual",
    paragraphs: [
      "Os direitos de propriedade intelectual sobre o software ZeytinSaaS, o seu código-fonte, design, marcas e todo o seu conteúdo pertencem ao Prestador ou aos seus licenciantes. As presentes Condições não transferem qualquer direito além da utilização do Serviço.",
      "O Utilizador não pode copiar, reproduzir, alugar, vender nem criar obras derivadas do Serviço. Os direitos sobre os Dados do Inquilino permanecem no Utilizador.",
    ],
  },
  {
    heading: "10. Lei Aplicável e Foro Competente",
    paragraphs: [
      "As presentes Condições são interpretadas e aplicadas nos termos de [UYGULANACAK HUKUK / LEI APLICÁVEL]. Se o Utilizador residir na União Europeia, ficam salvaguardadas as disposições imperativas da legislação de defesa do consumidor.",
      "Para qualquer litígio decorrente das presentes Condições é competente [YETKİLİ MAHKEME/TAHKİM / o foro de [ŞEHİR/ÜLKE]]. Esta cláusula não limita o direito dos consumidores de recorrerem aos tribunais do seu local de residência.",
    ],
  },
  {
    heading: "11. Alteração das Condições",
    paragraphs: [
      "O Prestador pode atualizar periodicamente as presentes Condições. As alterações essenciais são comunicadas com antecedência razoável dentro do Serviço ou através de [E-POSTA].",
      "A utilização continuada do Serviço após a entrada em vigor das alterações implica a sua aceitação. O Utilizador que não as aceite pode resolver o contrato nos termos da Secção 8.",
    ],
  },
  {
    heading: "12. Contacto",
    paragraphs: [
      "Para qualquer questão sobre as presentes Condições: [ŞİRKET ADI / COMPANY NAME], [ADRES], correio eletrónico: [E-POSTA].",
    ],
  },
];

export const privacy: Section[] = [
  {
    heading: "1. Identidade do Responsável pelo Tratamento",
    paragraphs: [
      "A presente Política de Privacidade foi elaborada em conformidade com o Regulamento Geral sobre a Proteção de Dados da União Europeia (\"RGPD\") e, quando aplicável, com a legislação turca de proteção de dados (\"KVKK\"). O ZeytinSaaS é prestado em várias regiões (Turquia e UE).",
      "Relativamente aos dados das contas do lagar (os dados de conta dos seus utilizadores), o responsável pelo tratamento (RGPD) é: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES], [E-POSTA], [VERGİ NO / VAT].",
      "DISTINÇÃO IMPORTANTE: relativamente aos dados dos clientes do próprio lagar (agricultores/produtores), o responsável pelo tratamento é o Inquilino; o ZeytinSaaS atua unicamente como subcontratante (data processor). Esta distinção é explicada nas Secções 2 e 3.",
    ],
  },
  {
    heading: "2. Categorias de Dados Pessoais Tratados",
    paragraphs: [
      "A) Contas de utilizador do lagar (o ZeytinSaaS é responsável): nome completo, endereço de correio eletrónico, número de telefone; dados de conta e de sessão; registos de operações/auditoria (logs); dados técnicos como o endereço IP e dados do navegador.",
      "B) Dados dos clientes do próprio Inquilino (o ZeytinSaaS é subcontratante): nome completo do agricultor/produtor, número de telefone, número de identificação nacional (TCKN na Turquia / documento equivalente na UE), saldos de conta corrente e registos financeiros, registos de produção/pesagem. O Inquilino introduz estes dados e é responsável pela respetiva base jurídica.",
      "O Prestador trata os dados do grupo (B) unicamente para prestar o Serviço e cumprir as instruções do Inquilino.",
    ],
  },
  {
    heading: "3. Nota Específica sobre o Número de Identificação Nacional e os Dados Sensíveis",
    paragraphs: [
      "O número de identificação nacional (na Turquia, o TCKN) é um dado identificativo de particular relevância que exige proporcionalidade e medidas de segurança adicionais. Só deve ser tratado quando necessário para as obrigações legais ou contabilísticas do Inquilino.",
      "Antes de introduzir dados como o número de identificação nacional, o Inquilino é obrigado a informar os titulares (agricultores) e a dispor da base jurídica necessária. O Prestador protege estes dados através de restrições de acesso, autorização e cifragem; contudo, a responsabilidade jurídica pela recolha cabe ao Inquilino.",
      "No RGPD, o número de identificação nacional não constitui uma \"categoria especial de dados\", mas exige proteção reforçada; não devem ser tratados no Serviço dados de categorias especiais (saúde, biometria, etc.).",
    ],
  },
  {
    heading: "4. Finalidades do Tratamento",
    paragraphs: [
      "Criação da conta de utilizador do lagar, autenticação e autorização; prestação, manutenção e melhoria do Serviço; resposta a pedidos de apoio; faturação e cobrança; garantia da segurança e prevenção de abusos; cumprimento de obrigações legais.",
      "Relativamente aos Dados do Inquilino, a finalidade limita-se aos fins definidos pelo Inquilino (gestão da produção/dos clientes/das contas); o Prestador não os utiliza para fins próprios de marketing ou definição de perfis.",
    ],
  },
  {
    heading: "5. Fundamentos Jurídicos do Tratamento",
    paragraphs: [
      "Execução de um contrato (RGPD art. 6.º, n.º 1, al. b): criação da conta, prestação do Serviço e faturação.",
      "Interesse legítimo (RGPD art. 6.º, n.º 1, al. f): segurança, prevenção de fraudes e melhoria do Serviço, respeitando os direitos e liberdades fundamentais do titular.",
      "Obrigação legal (RGPD art. 6.º, n.º 1, al. c): obrigações fiscais, contabilísticas e comunicações a organismos oficiais. Quando aplicável, é recolhido o consentimento (RGPD art. 6.º, n.º 1, al. a), que pode ser retirado a qualquer momento.",
    ],
  },
  {
    heading: "6. Destinatários e Subcontratantes (Sub-processors)",
    paragraphs: [
      "Os dados pessoais podem ser comunicados, dentro dos limites da finalidade, a subcontratantes como o fornecedor de alojamento na nuvem [BARINDIRMA SAĞLAYICISI], o fornecedor de correio/notificações [E-POSTA SAĞLAYICISI] e, quando exista, o fornecedor de SMS [SMS SAĞLAYICISI]. Os subcontratantes estão vinculados por contratos de tratamento de dados.",
      "Havendo obrigação legal, os dados podem ser comunicados às autoridades públicas competentes (p. ex. administrações fiscais). O Prestador não vende nem cede os Dados do Inquilino a terceiros para fins de marketing.",
      "A lista atualizada de subcontratantes pode ser solicitada em [E-POSTA].",
    ],
  },
  {
    heading: "7. Transferências Internacionais",
    paragraphs: [
      "Uma vez que o Serviço é prestado em várias regiões, os dados pessoais são alojados em [VERİ MERKEZİ BÖLGESİ / p. ex. UE ou Turquia]. Quando for necessário transferir dados para fora dessa região, aplicam-se garantias adequadas nos termos do Capítulo V do RGPD (decisão de adequação, Cláusulas Contratuais-Tipo/CCT ou consentimento explícito).",
      "Às transferências a partir da UE aplicam-se as regras do RGPD sobre transferência internacional; às transferências a partir da Turquia, o regime da KVKK.",
    ],
  },
  {
    heading: "8. Prazos de Conservação",
    paragraphs: [
      "Os dados pessoais são conservados pelo período necessário à finalidade do tratamento e durante os prazos legais de conservação previstos na legislação aplicável (p. ex. em matéria fiscal/comercial, [SAKLAMA SÜRESİ]).",
      "Cessada a finalidade ou expirado o prazo legal, os dados pessoais são apagados, destruídos ou anonimizados. Relativamente aos Dados do Inquilino, as instruções de conservação e eliminação são definidas pelo Inquilino.",
    ],
  },
  {
    heading: "9. Direitos do Titular dos Dados",
    paragraphs: [
      "Nos termos dos artigos 15.º a 22.º do RGPD, tem o direito de aceder aos seus dados pessoais, de obter a sua retificação, o seu apagamento (\"direito a ser esquecido\"), a limitação do tratamento, a portabilidade dos dados e de se opor ao tratamento. No tratamento baseado no consentimento, pode retirá-lo a qualquer momento.",
      "Para exercer estes direitos pode dirigir-se a [DPO E-POSTA] ou [E-POSTA]. Os seus pedidos serão respondidos, após verificação de identidade, no prazo máximo de um mês nos termos do RGPD.",
      "Tem ainda o direito de apresentar reclamação junto da autoridade de controlo: em Portugal, a Comissão Nacional de Proteção de Dados (CNPD); noutros Estados-Membros da UE, a autoridade competente do seu local de residência; na Turquia, a Autoridade de Proteção de Dados Pessoais (KVKK).",
    ],
  },
  {
    heading: "10. Cookies e Armazenamento Local (localStorage)",
    paragraphs: [
      "A aplicação utiliza o armazenamento local (localStorage) do seu navegador para a gestão de sessões e a autenticação; trata-se de um armazenamento técnico indispensável ao funcionamento do Serviço. Além disso, para o trabalho offline é conservada localmente uma fila de operações pendentes (offline queue).",
      "Este armazenamento local não tem finalidade de marketing nem de rastreio (tracking). Se apagar os dados do navegador, a sua sessão terminará e poderá perder os registos offline não sincronizados.",
      "Não são utilizados cookies de publicidade ou de rastreio de terceiros. Caso venham a ser utilizados, esta política será atualizada e serão implementados os mecanismos de consentimento necessários.",
    ],
  },
  {
    heading: "11. Medidas de Segurança",
    paragraphs: [
      "O Prestador aplica medidas técnicas e organizativas como a cifragem em trânsito (TLS), o controlo de acessos e a autorização baseada em funções, o isolamento de dados entre inquilinos, os registos de auditoria e as cópias de segurança periódicas.",
      "Nenhum método de transmissão pela internet é 100% seguro; não pode ser garantida uma segurança absoluta. O Utilizador é obrigado a utilizar palavras-passe robustas e a manter as suas credenciais confidenciais.",
    ],
  },
  {
    heading: "12. Alteração da Política",
    paragraphs: [
      "Esta Política de Privacidade pode ser atualizada periodicamente. As alterações essenciais são anunciadas dentro do Serviço ou através de [E-POSTA]. A data de \"última atualização\" no topo indica a versão em vigor.",
    ],
  },
  {
    heading: "13. Contacto",
    paragraphs: [
      "Responsável pelo tratamento: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES]. Encarregado da Proteção de Dados (DPO): [DPO E-POSTA]. Contacto geral: [E-POSTA]. Localização: [ŞEHİR/ÜLKE].",
    ],
  },
];
