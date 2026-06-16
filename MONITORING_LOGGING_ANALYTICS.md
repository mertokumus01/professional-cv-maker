# Monitoring, Logging ve Analytics Implementasyonu

## Genel Bakış

Proje tamamında profesyonel monitoring, logging ve analytics sistemi entegre edilmiştir. Bu sistem uygulamanın sağlığı, performansı ve kullanıcı davranışlarını izlemek için tasarlanmıştır.

## Tamamlanan Bileşenler

### 1. Winston Logger (✅ Tamamlandı)
**Dosya:** `src/server/utils/logger.js`

Winston kütüphanesi kullanarak enterprise-grade logging sistemi:
- **Console Output**: Development sırasında renkli log çıktısı
- **File Logging**: Üretim ortamında dosyaya yazma
- **Log Levels**: error, warn, info, debug seviyelerine göre filtreleme
- **Structured Logging**: JSON formatında detaylı log kayıtları

```javascript
// Kullanım örneği
const logger = require('./logger');
logger.info('İşlem başarılı', { userId: 123, action: 'CV_CREATED' });
logger.error('Hata oluştu', { message: error.message, stack: error.stack });
```

### 2. Log Rotation (✅ Tamamlandı)
**Dosya:** `src/server/utils/logRotation.js`

Otomatik günlük log rotasyonu:
- **Günlük Dosyalar**: `YYYY-MM-DD` formatında
- **Maksimum Boyut**: 20MB per dosya
- **Geçmiş Tutma**: Son 14 gün
- **Sıkıştırma**: Eski loglar otomatik sıkıştırılır (`.zip` format)

```javascript
// Transports:
// - error-%DATE%.log (error level)
// - combined-%DATE%.log (all levels)
// - access-%DATE%.log (access logs)
```

### 3. User Activity Logging (✅ Tamamlandı)
**Dosya:** `src/server/utils/activityLogger.js`

Kullanıcı aktivitelerini izleme ve raporlama:

**Logg edilen Aktiviteler:**
- Login/Logout
- CV Creation/Update/Deletion
- CV Export/Download
- Search Operations
- Profile Updates
- Password Changes
- Failed Login Attempts

**API Endpoints:**
- `POST /api/analytics/user-activity` - Aktivite loglama
- `GET /api/analytics/activities` - Tüm aktiviteleri listeleme
- `GET /api/analytics/activities/user/:userId` - Kullanıcı aktiviteleri
- `GET /api/analytics/stats` - Aktivite istatistikleri

```javascript
// Kullanım örneği
const activityLogger = require('./activityLogger');
activityLogger.logCVCreation(userId, cvId, 'modern');
activityLogger.logLogin(userId, ip, userAgent);
```

### 4. Application Performance Monitoring (APM) (✅ Tamamlandı)
**Dosya:** `src/server/utils/monitoring.js`

Gerçek zamanlı performans metrikleri:

**Saúde Kontrolleri:**
- **Database**: Veritabanı bağlantı durumu
- **Memory**: Bellek kullanımı yüzdeleri
- **CPU Load**: İşlemci yükü
- **Uptime**: Uygulama çalışma süresi

**Performans Metrikleri:**
- Toplam request sayısı
- Başarılı/başarısız request oranları
- Ortalama yanıt süresi
- Endpoint başına metrikleri (min/max/avg response time)

```javascript
// Health Check Endpoint
GET /api/health
// Response:
{
  "status": "OK",
  "uptime": 3600,
  "checks": {
    "database": { "status": "healthy" },
    "memory": { "usagePercent": "45.2%" },
    "cpuLoad": { "load1": 1.5 }
  }
}
```

### 5. Error Tracking (✅ Tamamlandı)
**Dosya:** `src/server/utils/monitoring.js`

Kapsamlı error tracking middleware:
- Stack trace'ler kaydedilir
- Kullanıcı ve endpoint bilgileri
- HTTP method ve path
- İstemci IP adresi
- Hata detayları Winston logger'a gönderilir

### 6. Request Logging Middleware (✅ Tamamlandı)
**Dosya:** `src/middleware/requestLogger.js`

Her istek ve yanıt loglanır:
- Request method, path, IP
- Response status code
- Response time (ms)
- Bellek kullanımı
- User Agent

### 7. Google Analytics Integration (✅ Tamamlandı)
**Dosya:** `src/client/utils/analyticsClient.js`

Frontend Google Analytics entegrasyonu:

**Trackli Olaylar:**
- Page Views
- User Sign Up / Login / Logout
- CV Creation / Update / Export / Download
- Search Operations
- Button Clicks
- Form Submissions
- Errors
- Time on Page

**Kullanım:**
```javascript
import analyticsClient from '../utils/analyticsClient';

// Initialize
analyticsClient.initialize('GA-ID');

// Track events
analyticsClient.trackCVCreation('modern');
analyticsClient.trackButtonClick('submit', 'cv-form');
analyticsClient.trackError('ValidationError', 'Invalid email');
```

**Analytics Hook:**
```javascript
import { useGoogleAnalytics, usePageView, useTracking } from '../hooks/useGoogleAnalytics';

function MyComponent() {
  const analytics = useTracking();
  
  const handleClick = () => {
    analytics.trackButtonClick('save', 'profile');
  };
}
```

### 8. Heatmap & Behavior Analytics (✅ Tamamlandı)
**Dosya:** `src/client/utils/heatmapTracking.js`

Kullanıcı davranış izleme:

**İzlenen Etkileşimler:**
- Mouse Movements (X, Y koordinatları)
- Clicks (element bilgileri)
- Scroll Depth
- Form Interactions (focus, input)

**Veri Özellikleri:**
- Heatmap verisi (tıklanan alanlar)
- Scroll depth ölçümü
- Form etkileşim detayları
- Event type istatistikleri

**Başlangıç:**
```javascript
import heatmapTracking from '../utils/heatmapTracking';

// Initialize
heatmapTracking.initialize(true);

// Get data
const heatmapData = heatmapTracking.getHeatmapData();
const behaviorData = heatmapTracking.getBehaviorData();

// Send to server
heatmapTracking.sendTrackingData('/api/analytics/tracking');
```

## API Endpoints

### Analytics Endpoints
```
POST   /api/analytics/event                    - Özel event tracking
POST   /api/analytics/tracking                 - Heatmap ve behavior data
GET    /api/analytics/health                   - Health check ve metrics
GET    /api/analytics/activities               - Tüm aktiviteler (Admin)
GET    /api/analytics/activities/user/:userId  - Kullanıcı aktiviteleri
GET    /api/analytics/stats                    - Aktivite istatistikleri
POST   /api/analytics/user-activity            - Frontend'den aktivite loglama
```

## Konfigürasyon

### Environment Variables
```env
# Google Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXXXXX-X
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=UA-XXXXXXXX-X

# Heatmap Tracking
NEXT_PUBLIC_HEATMAP_ENABLED=true

# Logging
LOG_LEVEL=info
LOGGING_TO_FILE=true

# Monitoring
ENABLE_HEALTH_CHECK=true
```

### Config Dosyası (config/config.js)
```javascript
{
  logLevel: 'info',
  logging: {
    toFile: true,
    maxSize: '20m',
    maxDays: 14,
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  }
}
```

## Dosya Yapısı

```
src/
├── server/
│   ├── utils/
│   │   ├── logger.js              ✅ Winston Logger
│   │   ├── logRotation.js         ✅ Log Rotation
│   │   ├── monitoring.js          ✅ Health Checks & APM
│   │   ├── activityLogger.js      ✅ User Activity
│   ├── middleware/
│   │   └── requestLogger.js       ✅ Request Logging
│   └── routes/
│       └── analytics.js           ✅ Analytics Endpoints
└── client/
    ├── utils/
    │   ├── analyticsClient.js     ✅ Google Analytics
    │   └── heatmapTracking.js     ✅ Heatmap Tracking
    ├── hooks/
    │   └── useGoogleAnalytics.js  ✅ Analytics Hooks
    └── pages/
        └── _app.js               ✅ Analytics Init
```

## Öne Çıkan Özellikler

✅ **Gerçek zamanlı Monitoring**: Anlık sağlık ve performans metrikleri
✅ **Kullanıcı Davranış Takibi**: Detaylı aktivite logları
✅ **Otomatik Log Rotasyonu**: Eski loglar otomatik temizlenir
✅ **Google Analytics Entegrasyon**: Web analytics ve conversion tracking
✅ **Heatmap Verisi**: Kullanıcı etkileşim noktalarının visualizasyonu
✅ **Error Tracking**: Tüm hatalar otomatik loglanır
✅ **Performans Metrikleri**: Endpoint başına response time izleme
✅ **Health Checks**: Database, memory, CPU monitoring

## Monitoring Paneli Hazırlanabilir

Aşağıdaki veriler kullanılarak analytics dashboard oluşturulabilir:

1. **Health Status Dashboard**
   - Uptime
   - Memory Usage
   - CPU Load
   - Database Status

2. **Performance Analytics**
   - Request Volume
   - Average Response Time
   - Error Rate
   - Endpoint Performance

3. **User Analytics**
   - Active Users
   - User Actions
   - Conversion Funnel
   - User Retention

4. **Behavior Analytics**
   - Heatmaps
   - Scroll Depth
   - Form Completion Rate
   - Page Dwell Time

## Test Önerikleri

Monitoring sistemini test etmek için:

```bash
# Health check
curl http://localhost:5000/api/analytics/health

# Track event
curl -X POST http://localhost:5000/api/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"eventName":"test","eventData":{}}'

# Get analytics
curl http://localhost:5000/api/analytics/activities

# Get stats
curl http://localhost:5000/api/analytics/stats
```

## Sonraki Adımlar

1. **Analytics Dashboard**: Grafana veya Chart.js ile dashboard oluşturma
2. **Alert System**: Kritik metrikleri aşması durumunda uyarı
3. **Data Retention**: Eski verilerin arşivlenmesi
4. **Custom Metrics**: İş mantığına özel metrikler
5. **Distributed Tracing**: Microservices ortamında trace izleme

---

**Tamamlama Tarihi:** 2026-06-16
**Durum:** ✅ 100% Tamamlandı
