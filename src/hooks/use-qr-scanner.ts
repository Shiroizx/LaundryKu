'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface UseQRScannerOptions {
    onScan: (decodedText: string) => void
    onError?: (error: string) => void
    fps?: number
    qrbox?: number
    aspectRatio?: number
}

interface UseQRScannerReturn {
    isScanning: boolean
    error: string | null
    startScanning: (elementId: string) => Promise<void>
    stopScanning: () => void
    toggleFlash: () => Promise<void>
    hasFlash: boolean
    isFlashOn: boolean
}

/**
 * Hook for QR code scanning using html5-qrcode
 */
export function useQRScanner({
    onScan,
    onError,
    fps = 10,
    qrbox = 250,
    aspectRatio = 1.777778,
}: UseQRScannerOptions): UseQRScannerReturn {
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasFlash, setHasFlash] = useState(false)
    const [isFlashOn, setIsFlashOn] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const onScanRef = useRef(onScan)
    const onErrorRef = useRef(onError)

    // Update refs when callbacks change
    useEffect(() => {
        onScanRef.current = onScan
        onErrorRef.current = onError
    }, [onScan, onError])

    const startScanning = useCallback(async (elementId: string) => {
        try {
            setError(null)

            // Clean up existing scanner
            if (scannerRef.current) {
                await scannerRef.current.stop()
                scannerRef.current = null
            }

            const scanner = new Html5Qrcode(elementId, {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                ],
                verbose: false,
            })

            scannerRef.current = scanner

            const devices = await Html5Qrcode.getCameras()
            if (!devices || devices.length === 0) {
                throw new Error('No camera found')
            }

            // Prefer back camera
            const backCamera = devices.find(
                (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
            )
            const cameraId = backCamera?.id || devices[0].id

            await scanner.start(
                cameraId,
                {
                    fps,
                    qrbox,
                    aspectRatio,
                    disableFlip: false,
                },
                (decodedText) => {
                    onScanRef.current(decodedText)
                },
                () => {
                    // QR code not found - ignore
                }
            )

            // Check for flash capability
            try {
                const capabilities = scanner.getRunningTrackCameraCapabilities()
                const torch = capabilities.torchFeature()
                setHasFlash(torch.isSupported())
            } catch {
                setHasFlash(false)
            }

            setIsScanning(true)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start scanner'
            setError(errorMessage)
            onErrorRef.current?.(errorMessage)
            setIsScanning(false)
        }
    }, [fps, qrbox, aspectRatio])

    const stopScanning = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop()
                scannerRef.current.clear()
            } catch {
                // Ignore stop errors
            }
            scannerRef.current = null
            setIsScanning(false)
            setIsFlashOn(false)
        }
    }, [])

    const toggleFlash = useCallback(async () => {
        if (scannerRef.current && hasFlash) {
            try {
                const capabilities = scannerRef.current.getRunningTrackCameraCapabilities()
                const torch = capabilities.torchFeature()
                if (isFlashOn) {
                    await torch.apply(false)
                } else {
                    await torch.apply(true)
                }
                setIsFlashOn(!isFlashOn)
            } catch {
                // Flash toggle failed
            }
        }
    }, [hasFlash, isFlashOn])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { })
            }
        }
    }, [])

    return {
        isScanning,
        error,
        startScanning,
        stopScanning,
        toggleFlash,
        hasFlash,
        isFlashOn,
    }
}