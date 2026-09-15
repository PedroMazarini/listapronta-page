/* Deletion-request page — all pt/en/es copy in one place.
   Key parity across the three languages is enforced by tests/delete-account.test.mjs, the same rule
   the app applies to strings.xml. */

export const CONTACT_EMAIL = 'mazariniapp@gmail.com';

export const COPY = {
  pt: {
    lang: 'pt-BR',
    doc_title: 'Excluir sua conta e seus dados — Lista Pronta',
    kicker: 'Lista Pronta',
    h1: 'Excluir sua conta e seus dados',
    lead: 'Você pode apagar sua conta do Lista Pronta a qualquer momento, pelo aplicativo ou por esta página. Não é preciso ter o app instalado para pedir.',
    lang_label: 'Idioma',

    inapp_h: 'No aplicativo (mais rápido)',
    inapp_p: 'Se você ainda tem o Lista Pronta instalado e consegue entrar na sua conta, este é o caminho mais direto:',
    inapp_steps: [
      'Abra o Lista Pronta e entre na sua conta.',
      'Toque no seu avatar para abrir o Perfil.',
      'Toque em “Excluir conta” e confirme.'
    ],

    web_h: 'Por esta página',
    web_p: 'Use o formulário abaixo se você desinstalou o aplicativo, perdeu o acesso ao aparelho ou prefere pedir por escrito. Pedimos apenas o e-mail da conta para localizá-la.',

    what_h: 'O que acontece',
    deleted_h: 'O que é apagado',
    deleted: [
      'Seu perfil: nome, avatar, e-mail e provedor de acesso.',
      'As listas que pertencem a você e todos os itens delas.',
      'Sua participação nas listas de outras pessoas.',
      'O estado da sua assinatura e a contagem de importações com IA.'
    ],
    kept_h: 'O que permanece',
    kept: [
      'Itens que você adicionou a listas de outras pessoas: eles fazem parte do conteúdo compartilhado daquelas listas. Seu nome e seu avatar deixam de aparecer.',
      'Contadores agregados de termos digitados, que não identificam ninguém.',
      'Registros que a lei nos obrigue a guardar, pelo prazo exigido.'
    ],
    when_h: 'Quando',
    when_p: 'A conta é desativada e some do aplicativo assim que o pedido é aceito. Se você entrar de novo em até 30 dias, tudo volta como estava. Depois desse prazo, os dados são apagados definitivamente. Se preferir a exclusão imediata, diga isso no campo de observações.',

    form_h: 'Pedir a exclusão',
    label_email: 'E-mail da conta',
    hint_email: 'O e-mail com que você entra no Lista Pronta.',
    label_scope: 'O que você quer apagar',
    scope_account: 'Minha conta e todos os meus dados',
    scope_data: 'Apenas alguns dados (explique abaixo)',
    label_details: 'Observações (opcional)',
    hint_details: 'Se escolheu apagar apenas alguns dados, diga quais. Se quer a exclusão imediata, sem os 30 dias, diga aqui.',
    submit: 'Enviar pedido',
    submitting: 'Enviando…',

    err_email_required: 'Informe o e-mail da conta.',
    err_email_invalid: 'Esse e-mail não parece válido.',
    err_scope_invalid: 'Escolha o que você quer apagar.',
    err_details_long: 'As observações passaram do limite de 1000 caracteres.',

    sent_h: 'Pedido recebido',
    sent_p: 'Registramos seu pedido e ele foi enviado para quem cuida do Lista Pronta. Você receberá uma resposta no e-mail informado.',
    sent_note: 'Respondemos em até 15 dias, como manda a LGPD. Guarde esta página caso precise pedir de novo.',
    sent_again: 'Fazer outro pedido',

    fail_h: 'Não conseguimos enviar',
    fail_p: 'Algo deu errado do nosso lado e o pedido não foi registrado. Tente de novo em alguns minutos ou escreva direto para o e-mail abaixo — um pedido por e-mail vale exatamente o mesmo.',
    offline_h: 'Sem conexão',
    offline_p: 'Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo, ou escreva direto para o e-mail abaixo.',
    rate_h: 'Muitos pedidos',
    rate_p: 'Já recebemos vários pedidos deste aparelho há pouco. Espere alguns minutos e tente de novo, ou escreva direto para o e-mail abaixo.',
    retry: 'Tentar de novo',

    fallback_h: 'Prefere e-mail?',
    fallback_p: 'Escreva para o endereço abaixo com o e-mail da sua conta e o que você quer apagar. Um pedido por e-mail tem exatamente o mesmo efeito que o formulário.',

    foot_home: 'Página inicial',
    foot_privacy: 'Privacidade',
    foot_terms: 'Termos de uso'
  },

  en: {
    lang: 'en',
    doc_title: 'Delete your account and data — Lista Pronta',
    kicker: 'Lista Pronta',
    h1: 'Delete your account and data',
    lead: 'You can delete your Lista Pronta account at any time, from the app or from this page. You do not need the app installed to ask.',
    lang_label: 'Language',

    inapp_h: 'In the app (fastest)',
    inapp_p: 'If you still have Lista Pronta installed and can sign in, this is the most direct route:',
    inapp_steps: [
      'Open Lista Pronta and sign in to your account.',
      'Tap your avatar to open your Profile.',
      'Tap “Delete account” and confirm.'
    ],

    web_h: 'From this page',
    web_p: 'Use the form below if you have uninstalled the app, lost access to the device, or would rather ask in writing. We only need the account’s e-mail address in order to find it.',

    what_h: 'What happens',
    deleted_h: 'What is deleted',
    deleted: [
      'Your profile: name, avatar, e-mail address and sign-in provider.',
      'The lists that belong to you and all of their items.',
      'Your membership of other people’s lists.',
      'Your subscription state and your AI import count.'
    ],
    kept_h: 'What stays',
    kept: [
      'Items you added to other people’s lists: they are part of that list’s shared content. Your name and avatar stop being shown.',
      'Aggregate counters of typed terms, which identify no one.',
      'Records the law requires us to keep, for the required period.'
    ],
    when_h: 'When',
    when_p: 'The account is deactivated and disappears from the app as soon as the request is accepted. If you sign in again within 30 days, everything comes back as it was. After that, the data is permanently erased. If you would rather it be erased immediately, say so in the notes field.',

    form_h: 'Request deletion',
    label_email: 'Account e-mail',
    hint_email: 'The e-mail address you sign in to Lista Pronta with.',
    label_scope: 'What you want deleted',
    scope_account: 'My account and all of my data',
    scope_data: 'Only some data (explain below)',
    label_details: 'Notes (optional)',
    hint_details: 'If you chose to delete only some data, say which. If you want immediate erasure without the 30 days, say so here.',
    submit: 'Send request',
    submitting: 'Sending…',

    err_email_required: 'Please enter the account e-mail address.',
    err_email_invalid: 'That e-mail address does not look valid.',
    err_scope_invalid: 'Please choose what you want deleted.',
    err_details_long: 'The notes are over the 1000-character limit.',

    sent_h: 'Request received',
    sent_p: 'We have recorded your request and passed it to whoever looks after Lista Pronta. You will get a reply at the e-mail address you gave.',
    sent_note: 'We answer within 15 days, as the LGPD requires. Keep this page in case you need to ask again.',
    sent_again: 'Make another request',

    fail_h: 'We could not send it',
    fail_p: 'Something went wrong on our side and the request was not recorded. Try again in a few minutes, or write straight to the address below — a request by e-mail counts exactly the same.',
    offline_h: 'No connection',
    offline_p: 'We could not reach the server. Check your connection and try again, or write straight to the address below.',
    rate_h: 'Too many requests',
    rate_p: 'We have had several requests from this device recently. Wait a few minutes and try again, or write straight to the address below.',
    retry: 'Try again',

    fallback_h: 'Prefer e-mail?',
    fallback_p: 'Write to the address below with your account e-mail and what you want deleted. A request by e-mail has exactly the same effect as the form.',

    foot_home: 'Home',
    foot_privacy: 'Privacy',
    foot_terms: 'Terms of use'
  },

  es: {
    lang: 'es',
    doc_title: 'Eliminar tu cuenta y tus datos — Lista Pronta',
    kicker: 'Lista Pronta',
    h1: 'Eliminar tu cuenta y tus datos',
    lead: 'Puedes eliminar tu cuenta de Lista Pronta cuando quieras, desde la aplicación o desde esta página. No necesitas tener la app instalada para pedirlo.',
    lang_label: 'Idioma',

    inapp_h: 'En la aplicación (lo más rápido)',
    inapp_p: 'Si todavía tienes Lista Pronta instalada y puedes entrar en tu cuenta, esta es la vía más directa:',
    inapp_steps: [
      'Abre Lista Pronta y entra en tu cuenta.',
      'Toca tu avatar para abrir el Perfil.',
      'Toca “Eliminar cuenta” y confirma.'
    ],

    web_h: 'Desde esta página',
    web_p: 'Usa el formulario de abajo si desinstalaste la aplicación, perdiste el acceso al dispositivo o prefieres pedirlo por escrito. Solo necesitamos el correo de la cuenta para localizarla.',

    what_h: 'Qué ocurre',
    deleted_h: 'Qué se elimina',
    deleted: [
      'Tu perfil: nombre, avatar, correo y proveedor de acceso.',
      'Las listas que te pertenecen y todos sus productos.',
      'Tu participación en las listas de otras personas.',
      'El estado de tu suscripción y el recuento de importaciones con IA.'
    ],
    kept_h: 'Qué permanece',
    kept: [
      'Los productos que agregaste a listas de otras personas: forman parte del contenido compartido de esas listas. Tu nombre y tu avatar dejan de mostrarse.',
      'Los contadores agregados de términos escritos, que no identifican a nadie.',
      'Los registros que la ley nos obligue a conservar, durante el plazo exigido.'
    ],
    when_h: 'Cuándo',
    when_p: 'La cuenta se desactiva y desaparece de la aplicación en cuanto se acepta la solicitud. Si vuelves a entrar en un plazo de 30 días, todo vuelve como estaba. Pasado ese plazo, los datos se eliminan definitivamente. Si prefieres la eliminación inmediata, indícalo en el campo de observaciones.',

    form_h: 'Solicitar la eliminación',
    label_email: 'Correo de la cuenta',
    hint_email: 'El correo con el que entras en Lista Pronta.',
    label_scope: 'Qué quieres eliminar',
    scope_account: 'Mi cuenta y todos mis datos',
    scope_data: 'Solo algunos datos (explícalo abajo)',
    label_details: 'Observaciones (opcional)',
    hint_details: 'Si elegiste eliminar solo algunos datos, indica cuáles. Si quieres la eliminación inmediata, sin los 30 días, dilo aquí.',
    submit: 'Enviar solicitud',
    submitting: 'Enviando…',

    err_email_required: 'Indica el correo de la cuenta.',
    err_email_invalid: 'Ese correo no parece válido.',
    err_scope_invalid: 'Elige qué quieres eliminar.',
    err_details_long: 'Las observaciones superan el límite de 1000 caracteres.',

    sent_h: 'Solicitud recibida',
    sent_p: 'Hemos registrado tu solicitud y la hemos enviado a quien se ocupa de Lista Pronta. Recibirás una respuesta en el correo que indicaste.',
    sent_note: 'Respondemos en un plazo de 15 días, como exige la LGPD. Guarda esta página por si necesitas pedirlo de nuevo.',
    sent_again: 'Hacer otra solicitud',

    fail_h: 'No pudimos enviarla',
    fail_p: 'Algo falló por nuestra parte y la solicitud no quedó registrada. Inténtalo de nuevo en unos minutos o escribe directamente a la dirección de abajo: una solicitud por correo vale exactamente igual.',
    offline_h: 'Sin conexión',
    offline_p: 'No pudimos contactar con el servidor. Comprueba tu conexión e inténtalo de nuevo, o escribe directamente a la dirección de abajo.',
    rate_h: 'Demasiadas solicitudes',
    rate_p: 'Hemos recibido varias solicitudes de este dispositivo hace poco. Espera unos minutos e inténtalo de nuevo, o escribe directamente a la dirección de abajo.',
    retry: 'Intentar de nuevo',

    fallback_h: '¿Prefieres el correo?',
    fallback_p: 'Escribe a la dirección de abajo con el correo de tu cuenta y qué quieres eliminar. Una solicitud por correo tiene exactamente el mismo efecto que el formulario.',

    foot_home: 'Página de inicio',
    foot_privacy: 'Privacidad',
    foot_terms: 'Términos de uso'
  }
};
