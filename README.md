# AFTER HOURS — A Private Memory Archive

**AFTER HOURS**, özel bir doğum günü hediyesi olarak tasarlanmış; üç boyutlu interaktif zarf açılışı, kişisel mektup, küratörlü fotoğraf sergisi, sinematik video arşivi ve gece gökyüzü altında final kutlaması içeren tamamen statik, modern ve duyarlı (responsive) bir web projesidir.

Proje herhangi bir framework veya derleme (build) adımına ihtiyaç duymadan **HTML5, Modern CSS ve Vanilla JavaScript (ES Modules)** ile geliştirilmiştir. Doğrudan **GitHub**'a yüklenip **Vercel** üzerinde yayınlanmaya hazırdır.

---

## 1. Proje Dosya ve Klasör Yapısı

```text
after-hours/
├── index.html                        # Ana HTML yapısı ve tüm bölümler
├── README.md                         # Kurulum, özelleştirme ve yayınlama rehberi
├── .gitignore                        # Git tarafından yoksayılacak sistem dosyaları
│
├── css/
│   ├── variables.css                 # Renk paleti, tipografi ve tasarım değişkenleri
│   ├── base.css                      # Sıfırlama (reset), temel tipografi ve konteyner kuralları
│   ├── components.css                # Zarf, mektup, galeri, video, modal ve sürpriz bileşenleri
│   ├── animations.css                # 3B zarf açılışı, geçişler ve prefers-reduced-motion kuralları
│   └── responsive.css                # Tablet ve mobil ekran uyumluluk kuralları
│
├── js/
│   ├── config.js                     # Tüm metinlerin, fotoğrafların ve videoların merkezi ayar dosyası
│   ├── main.js                       # Uygulama başlangıç noktası (ES Module)
│   ├── envelope.js                   # Zarf etkileşimi ve mektup oluşturma modülü
│   ├── gallery.js                    # Fotoğraf galerisi, küçük resimler, tam ekran lightbox ve swipe
│   ├── videos.js                     # Video arşivi ızgarası ve sinema modunda video oynatıcı
│   ├── surprise.js                   # Gece gökyüzü (Canvas) ve doğum günü kutlama modülü
│   └── effects.js                    # Özel Canvas konfeti motoru, toz partikülleri ve güvenli ses yöneticisi
│
└── assets/
    ├── images/
    │   └── image-instructions.txt    # Fotoğrafların ekleneceği klasör
    ├── videos/
    │   └── video-instructions.txt    # Videoların ekleneceği klasör
    └── audio/
        └── audio-instructions.txt    # Ses dosyalarının ekleneceği klasör