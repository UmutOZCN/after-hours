/**
 * MERKEZİ İÇERİK YAPILANDIRMASI (29 FOTOĞRAF & 20 VİDEO)
 * ============================================================
 * Tüm kişisel metinleri, fotoğraf başlıklarını ve videoları
 * animasyon kodlarına dokunmadan buradan düzenleyebilirsiniz.
 */

export const SITE_CONFIG = {
    recipientName: "OĞUZ",

    envelopeLabel: "SANA ÖZEL",

    letterTitle: "Sana küçük bir notum var.",

    letterParagraphs: [
        "Hayatıma girdiğin için, seni tanıdığım için ve bütün yaşadıklarımıza rağmen hâlâ birbirimizin yanında olduğumuz için çok mutluyum. Belki bazen birbirimizi çok kırıyoruz, çok büyük kavgalar ediyoruz ama ne olursa olsun içimde değişmeyen bir şey var: Ben hep senin yanında olmak istiyorum.",
        "Sen üzüldüğünde benim de içim parçalanıyor, canın yandığında sanki benim canım yanıyor. Bazen sana çok kırılsam, sana çok kızsam bile tek istediğim gelip sana sarılmak oluyor. Çünkü ne kadar kızgın olursam olayım, kendimi en çok senin kollarında huzurlu hissediyorum. ",
        "Ben seninle sadece güzel günleri değil, zor günleri de paylaşmak istiyorum. Her şey yolundayken değil, her şey kötü gittiğinde de birbirimizin elini bırakmayalım istiyorum. Hayat bizi nereye götürürse götürsün, senin yanında olmayı, seninle gülmeyi, seninle büyümeyi ve bütün zorlukları birlikte aşmayı istiyorum.",
        "Seni kelimelere sığdıramayacağım kadar çok seviyorum. Bazen bunu sana yeterince gösteremiyor olabilirim ama kalbimdeki yerin hiçbir şeyle kıyaslanamaz. İyi ki varsın, iyi ki benim hayatımdasın."
    ],

    letterSignature: "IMZA : ZEHRA",

    galleryTitle: "Anılar arşivi",

    gallerySubtitle: "Birlikte biriktirilen unutulmaz anlar.",

    videoTitle: "Hareketli anılar",

    videoSubtitle: "Bazı anılar fotoğraflardan fazlasıdır.",

    surpriseIntro: "Bir de son bir şey var.",

    surpriseButtonText: "Sürprizi aç",

    birthdayTitle: "İYİ Kİ DOĞDUN",

    finalMessage: "Dünyaya tekrar gelsem, yine seni bulurdum. Çünkü kalbim, nerede olursam olayım, hangi hayatta yaşarsam yaşayayım seni tanırdı. Belki yollarımız yine farklı olurdu, belki birbirimizi bulmamız zaman alırdı ama ben bir şekilde yine sana gelirdim. Çünkü benim kalbim seni bir kere sevdi ve ben her şeye yeniden başlasam bile yine aynı kalple, yine aynı aşkla seni seçerdim. Umarım bütün güzel hayallerini gerçekleştirirsin ve ben de her birinde yanında olurum.İyi ki doğdun sevgilim, iyi ki bu dünyaya geldin ve iyi ki benim hikâyemin en güzel parçası oldun. Seni çok seviyorum, hem de kelimelerin anlatabileceğinden çok daha fazla.",

    showMusicControl: true
};

/**
 * 29 FOTOĞRAFLIK GALERİ LİSTESİ
 * ./assets/images/ klasörüne photo-01.jpg ... photo-29.jpg dosyalarını atabilirsiniz.
 */
export const GALLERY_IMAGES = [
    { src: "./assets/images/photo-01.jpg", title: "Anı 01", description: "" },
    { src: "./assets/images/photo-02.jpg", title: "Anı 02", description: "" },
    { src: "./assets/images/photo-03.jpg", title: "Anı 03", description: "" },
    { src: "./assets/images/photo-04.jpg", title: "Anı 04", description: "" },
    { src: "./assets/images/photo-05.jpg", title: "Anı 05", description: "" },
    { src: "./assets/images/photo-06.jpg", title: "Anı 06", description: "" },
    { src: "./assets/images/photo-07.jpg", title: "Anı 07", description: "" },
    { src: "./assets/images/photo-08.jpg", title: "Anı 08", description: "" },
    { src: "./assets/images/photo-09.jpg", title: "Anı 09", description: "" },
    { src: "./assets/images/photo-10.jpg", title: "Anı 10", description: "" },
    { src: "./assets/images/photo-11.jpg", title: "Anı 11", description: "" },
    { src: "./assets/images/photo-12.jpg", title: "Anı 12", description: "" },
    { src: "./assets/images/photo-13.jpg", title: "Anı 13", description: "" },
    { src: "./assets/images/photo-14.jpg", title: "Anı 14", description: "" },
    { src: "./assets/images/photo-15.jpg", title: "Anı 15", description: "" },
    { src: "./assets/images/photo-16.jpg", title: "Anı 16", description: "" },
    { src: "./assets/images/photo-17.jpg", title: "Anı 17", description: "" },
    { src: "./assets/images/photo-18.jpg", title: "Anı 18", description: "" },
    { src: "./assets/images/photo-19.jpg", title: "Anı 19", description: "" },
    { src: "./assets/images/photo-20.jpg", title: "Anı 20", description: "" },
    { src: "./assets/images/photo-21.jpg", title: "Anı 21", description: "" },
    { src: "./assets/images/photo-22.jpg", title: "Anı 22", description: "" },
    { src: "./assets/images/photo-23.jpg", title: "Anı 23", description: "" },
    { src: "./assets/images/photo-24.jpg", title: "Anı 24", description: "" },
    { src: "./assets/images/photo-25.jpg", title: "Anı 25", description: "" },
    { src: "./assets/images/photo-26.jpg", title: "Anı 26", description: "" },
    { src: "./assets/images/photo-27.jpg", title: "Anı 27", description: "" },
    { src: "./assets/images/photo-28.jpg", title: "Anı 28", description: "" },
    { src: "./assets/images/photo-29.jpg", title: "Anı 29", description: "" }
];

/**
 * 20 VİDEOLUK ARŞİV LİSTESİ
 * Videolar ./assets/videos/ klasöründen, kapak görselleri ./assets/images/ klasöründen yüklenir.
 * (Kapak görseli koymazsanız otomatik olarak şık "VİDEO 01..20" kapak tasarımı görünür.)
 */
export const VIDEO_ITEMS = [
    { src: "./assets/videos/video-01.mp4", poster: "./assets/images/video-cover-01.jpg", title: "Video 01", description: "" },
    { src: "./assets/videos/video-02.mp4", poster: "./assets/images/video-cover-02.jpg", title: "Video 02", description: "" },
    { src: "./assets/videos/video-03.mp4", poster: "./assets/images/video-cover-03.jpg", title: "Video 03", description: "" },
    { src: "./assets/videos/video-04.mp4", poster: "./assets/images/video-cover-04.jpg", title: "Video 04", description: "" },
    { src: "./assets/videos/video-05.mp4", poster: "./assets/images/video-cover-05.jpg", title: "Video 05", description: "" },
    { src: "./assets/videos/video-06.mp4", poster: "./assets/images/video-cover-06.jpg", title: "Video 06", description: "" },
    { src: "./assets/videos/video-07.mp4", poster: "./assets/images/video-cover-07.jpg", title: "Video 07", description: "" },
    { src: "./assets/videos/video-08.mp4", poster: "./assets/images/video-cover-08.jpg", title: "Video 08", description: "" },
    { src: "./assets/videos/video-09.mp4", poster: "./assets/images/video-cover-09.jpg", title: "Video 09", description: "" },
    { src: "./assets/videos/video-10.mp4", poster: "./assets/images/video-cover-10.jpg", title: "Video 10", description: "" },
    { src: "./assets/videos/video-11.mp4", poster: "./assets/images/video-cover-11.jpg", title: "Video 11", description: "" },
    { src: "./assets/videos/video-12.mp4", poster: "./assets/images/video-cover-12.jpg", title: "Video 12", description: "" },
    { src: "./assets/videos/video-13.mp4", poster: "./assets/images/video-cover-13.jpg", title: "Video 13", description: "" },
    { src: "./assets/videos/video-14.mp4", poster: "./assets/images/video-cover-14.jpg", title: "Video 14", description: "" },
    { src: "./assets/videos/video-15.mp4", poster: "./assets/images/video-cover-15.jpg", title: "Video 15", description: "" },
    { src: "./assets/videos/video-16.mp4", poster: "./assets/images/video-cover-16.jpg", title: "Video 16", description: "" },
    { src: "./assets/videos/video-17.mp4", poster: "./assets/images/video-cover-17.jpg", title: "Video 17", description: "" },
    { src: "./assets/videos/video-18.mp4", poster: "./assets/images/video-cover-18.jpg", title: "Video 18", description: "" },
    { src: "./assets/videos/video-19.mp4", poster: "./assets/images/video-cover-19.jpg", title: "Video 19", description: "" },
    { src: "./assets/videos/video-20.mp4", poster: "./assets/images/video-cover-20.jpg", title: "Video 20", description: "" }
];

/**
 * SES DOSYASI YOLLARI
 */
export const AUDIO_PATHS = {
    envelopeConfetti: "./assets/audio/envelope-confetti.mp3",
    surpriseConfetti: "./assets/audio/surprise-confetti.mp3",
    backgroundMusic: "./assets/audio/background-music.mp3"
};