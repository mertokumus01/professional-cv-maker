# Monitoring, Logging ve Analytics - Hızlı Başlangıç Kılavuzu

## 📋 Kurulum Adımları

### 1. Environment Variables Ayarla (.env)
```env
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=UA-XXXXXXXX-X

# Heatmap Tracking (İsteğe bağlı)
NEXT_PUBLIC_HEATMAP_ENABLED=true

# Logging
LOG_LEVEL=info
LOGGING_TO_FILE=true
```

### 2. Winston-Daily-Rotate-File Paketi Yükle
```bash
npm install winston-daily-rotate-file
```

## 🚀 Kullanım Örnekleri

### Backend - Aktivite Loglama

```javascript
const activityLogger = require('../utils/activityLogger');

// Login tracking
activityLogger.logLogin(userId, '192.168.1.1', 'Mozilla/5.0...');

// CV creation
activityLogger.logCVCreation(userId, cvId, 'modern');

// Search tracking
activityLogger.logSearch(userId, 'javascript', 5);

// Password change
activityLogger.logPasswordChange(userId, '192.168.1.1');
```

### Frontend - Google Analytics

```javascript
import { useTracking } from '../hooks/useGoogleAnalytics';

function CVForm() {
  const analytics = useTracking();

  const handleSubmit = async (data) => {
    try {
      const response = await createCV(data);
      analytics.trackCVCreation('modern');
    } catch (error) {
      analytics.trackError('CVCreationError', error.message);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Health Check Kontrolü

```bash
# Development
curl http://localhost:5000/api/analytics/health

# Veritabanı, bellek ve CPU durumunu kontrol et
curl http://localhost:5000/api/health
```

### Aktiviteleri Sorgula

```bash
# Son 50 aktiviteyi al
curl "http://localhost:5000/api/analytics/activities?limit=50"

# Kullanıcı aktivitelerini al
curl "http://localhost:5000/api/analytics/activities/user/user-123?limit=100"

# İstatistikleri al
curl http://localhost:5000/api/analytics/stats
```

## 📊 Log Dosyaları

Loglar `logs/` klasöründe depolanır:

```
logs/
├── error-2026-06-16.log         # Sadece error level loglar
├── combined-2026-06-16.log      # Tüm level loglar
├── access-2026-06-16.log        # API erişim logları
├── error-2026-06-15.log.zip     # Eski compressed loglar
└── ...
```

## 🎯 Takip Ettiğimiz Olaylar

### Kullanıcı Olayları
- ✅ Login / Logout
- ✅ Sign Up
- ✅ Profile Update
- ✅ Password Change / Reset

### CV Olayları
- ✅ CV Create / Update / Delete
- ✅ CV Export (PDF, Word, JSON, CSV)
- ✅ CV Download
- ✅ CV Preview View

### Sistem Olayları
- ✅ Search Operations
- ✅ Button Clicks
- ✅ Form Submissions
- ✅ Errors (tüm hata tipleri)
- ✅ Time on Page

### Davranış Olayları (Heatmap)
- ✅ Mouse Movements
- ✅ Clicks
- ✅ Scrolls (Scroll Depth)
- ✅ Form Interactions

## 🔍 Performance Metrikleri

Takip edilen metrikleri almak için:

```bash
curl http://localhost:5000/api/analytics/health | jq '.'
```

Response örneği:
```json
{
  "status": "OK",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection OK"
    },
    "memory": {
      "status": "healthy",
      "usagePercent": "42.5%"
    },
    "cpuLoad": {
      "status": "healthy",
      "load1": "1.5"
    }
  }
}
```

## 🛠️ Sorun Giderme

### Log Dosyaları Yazılmıyor
```bash
# logs klasörü oluşturuldu mu kontrol et
ls -la logs/

# Eğer yok ise oluştur
mkdir logs
```

### Google Analytics Çalışmıyor
1. `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` env variable ayarlandı mı kontrol et
2. Browser console'da hata var mı kontrol et
3. GA hesabı aktif mi ve ID doğru mu kontrol et

### Heatmap Data Alınmıyor
1. `NEXT_PUBLIC_HEATMAP_ENABLED=true` ayarlandı mı kontrol et
2. Browser'da tracking data kaydediliyor mu kontrol et:
```javascript
// Browser console'da
import heatmapTracking from './utils/heatmapTracking';
console.log(heatmapTracking.getHeatmapData());
```

## 📈 İstatistik Örneği

```javascript
// ActivityStats example
{
  "totalActivities": 1523,
  "activitiesByType": {
    "LOGIN": 156,
    "CV_CREATED": 89,
    "CV_UPDATED": 234,
    "SEARCH": 445
  },
  "activitiesByUser": {
    "user-1": 156,
    "user-2": 234,
    "user-3": 123
  }
}
```

## 🔐 Veri Gizliliği

- Hassas veriler (passwords, tokens) loglanmaz
- User aktiviteler sadece audit amacıyla kaydedilir
- Log dosyaları sunucuda güvenli şekilde saklanır
- Eski loglar 14 gün sonra silinir

## 📱 Analytics Dashboard Örnekleri

### Real-time Health Status
```javascript
const health = await fetch('/api/analytics/health').then(r => r.json());
console.log(`Uptime: ${health.uptime}s`);
console.log(`Memory: ${health.checks.memory.usagePercent}`);
```

### Activity Timeline
```javascript
const activities = await fetch('/api/analytics/activities?limit=10').then(r => r.json());
activities.data.forEach(act => {
  console.log(`${act.timestamp}: ${act.userId} - ${act.action}`);
});
```

### Performance per Endpoint
```javascript
const stats = await fetch('/api/analytics/stats').then(r => r.json());
Object.entries(stats.data.activitiesByType).forEach(([type, count]) => {
  console.log(`${type}: ${count} occurrences`);
});
```

## 🎓 En İyi Uygulamalar

1. **Log Seviyeleri Ayarı**
   - Development: `debug`
   - Production: `info` veya `warn`

2. **Event Naming Convention**
   - Yapısı: `ENTITY_ACTION` (CV_CREATED, USER_LOGIN)
   - Küçük harf: JavaScript/TypeScript kodu
   - Büyük harf: Activity logs

3. **Tracking Data Gönderimi**
   - Sayfa unload'lanırken heatmap verisi gönder
   - Batch'i 5 dakikada bir gönder
   - Hata durumunda retry yap

4. **Performance Optimization**
   - Aktivite logging async yapılır
   - Heatmap tracking debounce edilir
   - Log rotation eski dosyaları otomatik temizler

---

**Kontrol Listesi:**
- [ ] `.env` dosyasına Analytics ID ekle
- [ ] `winston-daily-rotate-file` paketi yüklü mü kontrol et
- [ ] Frontend'de heatmap tracking etkinleşti mi kontrol et
- [ ] Health endpoint test et
- [ ] Aktiviteleri sorgula
- [ ] Dashboard paneli hazırla
