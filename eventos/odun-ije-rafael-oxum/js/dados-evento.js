/**
 * Cadastro do evento
 *
 * Este é o único arquivo que deve ser alterado ao reutilizar o site para
 * outro evento. A estrutura visual e a lógica usam os dados abaixo.
 */
const EVENTO = {
    tituloEvento: "Odún Ìjé • Rafael de Oxum",
    nomeEvento: "Odún Ìjé",
    celebrante: "Rafael de Oxum",
    descricao: "Você é nosso convidado para celebrar conosco no dia 30 de janeiro de 2027, às 20h.",
    slug: "odun-ije-rafael-oxum",

    // Use o padrão AAAA-MM-DD para evitar ambiguidades entre navegadores.
    data: "2027-01-30",
    horario: "20:00",

    calendario: {
        // A duração é somente uma sugestão: cada convidado pode ajustá-la ao salvar.
        duracaoMinutos: 60
    },

    rsvp: {
        descricao: "Confirme sua presença no evento através do formulário oficial.",
        link: "https://forms.gle/j9Ku8Jot2Wvscx356"
    },

    local: "Igbá Àṣẹ Iyá Aféfê Igbin Lórun - Àṣẹ Esmeralda",
    endereco: "Rua Mariana do Rosário, 109",
    bairro: "Ponte Preta",
    cidade: "Magé",
    estado: "RJ",
    cep: "25900-970",

    localizacao: {
        descricao: "Escolha seu aplicativo de navegação preferido e trace a melhor rota.",
        mensagem: "Toque em um dos botões abaixo para abrir automaticamente a localização do evento.",
        googleMaps: "https://www.google.com/maps/dir//R.+Mariana+do+Ros%C3%A1rio,+109+-+Vila+Recreio,+Mag%C3%A9+-+RJ,+25900-970/@-22.7749,-43.2914,17z/data=!4m18!1m8!3m7!1s0x990ad239448339:0x56e548d8d0f97534!2sR.+Mariana+do+Ros%C3%A1rio,+109+-+Vila+Recreio,+Mag%C3%A9+-+RJ,+25900-970!3b1!8m2!3d-22.6450252!4d-43.2053367!16s%2Fg%2F11x64xg80t!4m8!1m0!1m5!1m1!1s0x990ad239448339:0x56e548d8d0f97534!2m2!1d-43.2053367!2d-22.6450252!3e0!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDcyMi4wIKXMDSoASAFQAw%3D%3D",
        waze: "https://waze.com/ul/h75cr0vdgj"
    },

    telefone: "",
    email: "",
    instagram: "",

    // Cole aqui os links completos dos perfis das casas para tornar os brasões clicáveis.
    casas: {
        aseEsmeraldaInstagram: "https://www.instagram.com/aseesmeralda/",
        aseTopazioInstagram: "https://www.instagram.com/asetopazio/"
    },

    identidadeVisual: {
        logo: "img/logo-evento.png",
        fundo: "img/fundo.png",
        convite: "img/convite.png",
        brasaoAseEsmeralda: "img/brasao1.png",
        brasaoAseTopazio: "img/brasao2.png",
        favicon: "img/favicon/logo-evento.ico",
        imagemCompartilhamento: "img/convite.png"
    },

    subtituloHero: "Uma celebração de fé, ancestralidade e renovação.",
    mensagemHero: "Com alegria e profunda gratidão, convido você para compartilhar este momento tão especial da minha caminhada espiritual.",
    observacoes: ""
};
