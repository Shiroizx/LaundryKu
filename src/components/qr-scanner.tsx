'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
    onResult: (result: string) => void
}

export function QRScanner({ onResult }: QRScannerProps) {
    const scannerId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`).current
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return

        let mounted = true
        let isStarting = false
        let localStream: MediaStream | null = null

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError('Kamera tidak dapat diakses. Pastikan Anda mengakses web ini menggunakan koneksi aman (HTTPS/Localhost) dan browser mendukung fitur kamera.')
            return
        }

        // Intercept getUserMedia to steal the MediaStream reference
        // This is necessary because if the component unmounts mid-startup,
        // html5-qrcode loses track of the stream and leaves the camera on.
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
        navigator.mediaDevices.getUserMedia = async function (constraints) {
            try {
                const stream = await originalGetUserMedia(constraints)
                localStream = stream
                return stream
            } catch (err) {
                throw err
            }
        }

        const startScanner = async () => {
            if (isStarting) return
            isStarting = true

            try {
                // Initialize barebones scanner
                const scanner = new Html5Qrcode(scannerId)
                scannerRef.current = scanner

                // Monkey patch the DOM element to catch removeChild errors from html5-qrcode
                const el = document.getElementById(scannerId)
                if (el) {
                    const originalRemoveChild = el.removeChild.bind(el)
                    el.removeChild = function <T extends Node>(child: T): T {
                        try {
                            return originalRemoveChild(child) as T
                        } catch (e: any) {
                            if (e.name === 'NotFoundError') {
                                return child // Suppress error!
                            }
                            throw e
                        }
                    }
                }

                await scanner.start(
                    { facingMode: "environment" },
                    { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 } 
                    },
                    (decodedText) => {
                        if (mounted) {
                            // Stop scanning immediately on success to prevent multiple scans
                            if (scanner.isScanning) {
                                scanner.pause()
                            }
                            onResult(decodedText)
                        }
                    },
                    () => {
                        // Ignore continuous frame errors
                    }
                )
                
                if (!mounted && scanner.isScanning) {
                    // If unmounted while starting
                    await scanner.stop().catch(() => {})
                    try { scanner.clear() } catch(e) {}
                }
            } catch (err: any) {
                if (mounted) {
                    setCameraError(err?.message || "Gagal mengakses kamera. Pastikan izin kamera diberikan.")
                    console.error("Camera error:", err)
                }
            } finally {
                isStarting = false
            }
        }

        startScanner()

        return () => {
            mounted = false
            
            // Restore getUserMedia
            navigator.mediaDevices.getUserMedia = originalGetUserMedia

            // 0. Prevent html5-qrcode from throwing 'onabort' when we forcefully kill the track
            try {
                const videoEl = document.getElementById(scannerId)?.querySelector('video')
                if (videoEl) {
                    videoEl.onabort = null
                    videoEl.onerror = null
                    videoEl.onstalled = null
                    videoEl.onsuspend = null
                }
            } catch (e) {}

            // 1. Force kill the intercepted media stream (100% Bulletproof)
            if (localStream) {
                try {
                    localStream.getTracks().forEach(track => {
                        track.stop()
                        track.enabled = false
                    })
                } catch (e) {
                    console.error("Error stopping intercepted tracks:", e)
                }
            }
            
            // 2. Also try killing via video element just in case it escaped
            try {
                const videoEl = document.getElementById(scannerId)?.querySelector('video')
                if (videoEl && videoEl.srcObject) {
                    const stream = videoEl.srcObject as MediaStream
                    stream.getTracks().forEach(track => {
                        track.stop()
                        track.enabled = false
                    })
                    videoEl.srcObject = null
                }
            } catch (e) {
                console.error("Error stopping video tracks directly:", e)
            }

            // 3. Tell the scanner instance to cleanup
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().then(() => {
                        try { scannerRef.current?.clear() } catch (e) { /* ignore */ }
                    }).catch(() => {}) // Suppress any stop errors
                } else {
                    try { scannerRef.current.clear() } catch (e) { /* ignore */ }
                }
                scannerRef.current = null
            }
        }
    }, [isClient, onResult, scannerId])

    if (!isClient) return null

    return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-black rounded-xl overflow-hidden relative">
            {cameraError ? (
                <div className="text-red-500 text-center p-4 text-sm font-medium z-10">
                    {cameraError}
                </div>
            ) : (
                <div className="text-white/50 text-sm absolute z-0">
                    Memulai kamera...
                </div>
            )}
            <div id={scannerId} className="w-full h-full z-10 [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
        </div>
    )
}
