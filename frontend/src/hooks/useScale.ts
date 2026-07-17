import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Ağırlık: tam sayı VEYA ondalıklı, hem nokta hem virgül ayracıyla.
// Avrupa terazileri "12,5 kg" (virgül) gönderir; eski regex sadece tam sayı +
// "kg" ekini yakalıyor, ondalık ve virgülü kaçırıyordu. Binlik ayracı da
// (1.234,5 / 1,234.5) tolere edilir.
const WEIGHT_REGEX = /([+-]?\s*\d[\d.,]*)\s*kg/i;

/**
 * Terazi çıktısındaki sayıyı ayrıştırır. Hem "12.5" hem "12,5" hem de binlik
 * ayraçlı "1.234,5" / "1,234.5" biçimlerini destekler.
 *
 * Kural: SON nokta/virgül ondalık ayracıdır; ondan öncekiler binlik ayracıdır
 * ve atılır. Ayraç yoksa tam sayıdır.
 */
function parseWeight(raw: string): number | null {
  const s = raw.replace(/\s+/g, "");
  const lastSep = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));

  let normalized: string;
  if (lastSep === -1) {
    normalized = s;
  } else {
    const intPart = s.slice(0, lastSep).replace(/[.,]/g, "");
    const fracPart = s.slice(lastSep + 1);
    normalized = `${intPart}.${fracPart}`;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

type ScaleState = {
  weightKg: number | null;
  isConnected: boolean;
  error: string | null;
};

export type UseScaleResult = ScaleState & {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export function useScale(): UseScaleResult {
  const t = useTranslations("terminal");
  // `t`'yi ref'te tut: connect/disconnect callback'lerinin kimliği
  // (empty deps) değişmesin, ama en güncel çeviriyi kullansın.
  const tRef = useRef(t);
  tRef.current = t;

  const [state, setState] = useState<ScaleState>({
    weightKg: null,
    isConnected: false,
    error: null,
  });

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const readableStreamClosedRef = useRef<Promise<void> | null>(null);
  const bufferRef = useRef<string>("");

  const disconnect = useCallback(async () => {
    try {
      const reader = readerRef.current;
      if (reader) {
        await reader.cancel();
        if (readableStreamClosedRef.current) {
          await readableStreamClosedRef.current.catch(() => {});
        }
        readerRef.current = null;
      }
      
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      
      setState((prev) => ({ ...prev, isConnected: false, weightKg: null }));
    } catch (error) {
      console.error("Kantar bağlantısı kesilirken hata:", error);
      // Hata olsa bile state'i temizle ki UI takılı kalmasın
      setState((prev) => ({ ...prev, isConnected: false, error: tRef.current("scaleError.disconnect") }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!("serial" in navigator)) {
      setState((prev) => ({
        ...prev,
        error: tRef.current("scaleError.notSupported"),
      }));
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;

      const decoder = new TextDecoderStream();
      // TextDecoderStream.writable, BufferSource kabul eder; port.readable ise
      // Uint8Array yayar. DOM tipleri bu genişleme ilişkisini (BufferSource >
      // Uint8Array) pipeTo için modellemediğinden daraltılmış tiple eşleştiriyoruz.
      const readableStreamClosed = port.readable?.pipeTo(
        decoder.writable as WritableStream<Uint8Array>,
      );
      readableStreamClosedRef.current = readableStreamClosed ?? null;

      const reader = decoder.readable.getReader();
      readerRef.current = reader;
      
      setState((prev) => ({ ...prev, isConnected: true, error: null }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Reader iptal edildiğinde döngüden çık
          reader.releaseLock();
          break;
        }

        if (value) {
          bufferRef.current += value;
          const lines = bufferRef.current.split(/\r?\n/);
          bufferRef.current = lines.pop() ?? "";

          for (const line of lines) {
            const match = WEIGHT_REGEX.exec(line);
            if (match) {
              const parsed = parseWeight(match[1]);
              if (parsed !== null) {
                setState((prev) => ({ ...prev, weightKg: parsed }));
              }
            }
          }
        }
      }
    } catch (error) {
       console.error("Kantar okuma hatası:", error);
       setState((prev) => ({
         ...prev,
         isConnected: false,
         error: tRef.current("scaleError.readFailed"),
       }));
    }
  }, []);

  useEffect(() => {
    return () => {
       // Component unmount olurken temizlik yapma girişimi
       // Not: Async olduğu için tam garanti değildir ama denemek iyidir
       if(portRef.current && portRef.current.readable) {
          // disconnect() çağrısı burada güvenli olmayabilir, o yüzden boş bırakıyoruz
          // Kullanıcı manuel "Bağlantıyı Kes" demeli.
       }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
}
