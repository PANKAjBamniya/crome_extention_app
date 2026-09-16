import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { hasWallets } from '../services/walletStorage'

import Onboarding from '../pages/Onboarding/Onboarding'
import CreateWallet from '../pages/CreateWallet/CreateWallet'
import ImportWallet from '../pages/ImportWallet/ImportWallet'
import CreatePassword from '../pages/CreatePassword/CreatePassword'
import RevealMnemonic from '../pages/RevealMnemonic/RevealMnemonic'
import WalletReady from '../pages/WalletReady/WalletReady'
import Wallet from '../pages/Wallet/Wallet'
import Unlock from '../pages/Unlock/Unlock'
import ComingSoon from '../components/ComingSoon/ComingSoon'

const StartupGuard = () => {
    const [loading, setLoading] = useState(true)
    const [hasWallet, setHasWallet] = useState(false)
    const isUnlocked = useSelector((state: RootState) => state.wallet.isUnlocked)

    useEffect(() => {
        let isMounted = true
        hasWallets().then((exists: boolean) => {
            if (isMounted) {
                setHasWallet(exists)
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    if (loading) {
        return <div className="h-screen w-full bg-black" />
    }

    if (!hasWallet) {
        return <Navigate to="/onboarding" replace />
    }

    if (isUnlocked) {
        return <Navigate to="/wallet" replace />
    }

    return <Navigate to="/unlock" replace />
}

const OnboardingGuard = () => {
    const [loading, setLoading] = useState(true)
    const [hasWallet, setHasWallet] = useState(false)
    const isUnlocked = useSelector((state: RootState) => state.wallet.isUnlocked)

    useEffect(() => {
        let isMounted = true
        hasWallets().then((exists: boolean) => {
            if (isMounted) {
                setHasWallet(exists)
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    if (loading) {
        return <div className="h-screen w-full bg-black" />
    }

    // If wallet already exists, do not show onboarding
    if (hasWallet && !isUnlocked) {
        return <Navigate to="/unlock" replace />
    }

    if (hasWallet && isUnlocked) {
        return <Navigate to="/wallet" replace />
    }

    return <Onboarding />
}

const ProtectedWalletRoute = () => {
    const isUnlocked = useSelector((state: RootState) => state.wallet.isUnlocked)
    const [loading, setLoading] = useState(true)
    const [hasWallet, setHasWallet] = useState(false)

    useEffect(() => {
        let isMounted = true
        hasWallets().then((exists: boolean) => {
            if (isMounted) {
                setHasWallet(exists)
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    if (loading) {
        return <div className="h-screen w-full bg-black" />
    }

    if (!hasWallet) {
        return <Navigate to="/onboarding" replace />
    }

    if (!isUnlocked) {
        return <Navigate to="/unlock" replace />
    }

    return <Wallet />
}

const AppRoutes = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<StartupGuard />} />
                <Route path="/onboarding" element={<OnboardingGuard />} />
                <Route path="/unlock" element={<Unlock />} />
                <Route path="/wallet" element={<ProtectedWalletRoute />} />
                <Route path="/create-wallet" element={<CreateWallet />} />
                <Route path="/import-wallet" element={<ImportWallet />} />
                <Route path="/create-password" element={<CreatePassword />} />
                <Route path="/confirm-password" element={<CreatePassword />} />
                <Route path="/reveal-mnemonic" element={<RevealMnemonic />} />
                <Route path="/wallet-ready" element={<WalletReady />} />
                <Route path="*" element={<ComingSoon />} />
            </Routes>
        </HashRouter>
    )
}

export default AppRoutes