#!/usr/bin/env node

/**
 * PostgreSQL Database Backup Script
 * 
 * Bu script, pg_dump kullanarak veritabanını yedekler.
 * Yedekler, proje klasöründeki /backups dizinine kaydedilir.
 * 
 * Kullanım: npm run db:backup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// .env dosyasını manuel olarak oku (dotenv bağımlılığı olmadan)
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Tırnak işaretlerini kaldır
      process.env[key] = value;
    }
  });
}

// DATABASE_URL'i al
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ HATA: DATABASE_URL .env dosyasında bulunamadı.');
  process.exit(1);
}

// DATABASE_URL'den connection bilgilerini parse et
// Format: postgresql://user:password@host:port/database
let dbConfig;
try {
  const url = new URL(databaseUrl);
  dbConfig = {
    host: url.hostname,
    port: url.port || '5432',
    database: url.pathname.slice(1), // Başındaki '/' karakterini kaldır
    user: url.username,
    password: url.password,
  };
} catch (error) {
  console.error('❌ HATA: DATABASE_URL formatı geçersiz:', error.message);
  process.exit(1);
}

// Backups dizinini oluştur
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
  console.log('✅ Backups dizini oluşturuldu:', backupsDir);
}

// Tarih formatında dosya adı oluştur
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
const filename = `backup-${dateStr}-${timeStr}.sql`;
const filepath = path.join(backupsDir, filename);

// pg_dump komutunu oluştur
// PGPASSWORD environment variable kullanarak şifreyi güvenli şekilde geçiriyoruz
const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${filepath}"`;

console.log('🔄 Veritabanı yedekleniyor...');
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   Output: ${filepath}`);

try {
  // pg_dump komutunu çalıştır
  execSync(pgDumpCommand, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    },
  });

  // Dosya boyutunu kontrol et
  const stats = fs.statSync(filepath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('✅ Yedekleme başarılı!');
  console.log(`   Dosya: ${filename}`);
  console.log(`   Boyut: ${fileSizeMB} MB`);
  console.log(`   Konum: ${filepath}`);
} catch (error) {
  console.error('❌ Yedekleme hatası:', error.message);
  
  // Eğer pg_dump bulunamadıysa
  if (error.message.includes('pg_dump') || error.message.includes('command not found')) {
    console.error('\n💡 Çözüm: PostgreSQL client tools yüklü olmalıdır.');
    console.error('   macOS: brew install postgresql');
    console.error('   Ubuntu/Debian: sudo apt-get install postgresql-client');
    console.error('   Windows: PostgreSQL installer ile birlikte gelir.');
  }
  
  process.exit(1);
}
