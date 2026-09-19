import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
import Assets from '../pages/Assets/Assets'
import ImportToken from '../pages/Assets/ImportToken'
import Accounts from '../pages/Accounts/Accounts'
import AccountDetails from '../components/AccountDetails'
import Receive from '../pages/Receive/Receive'
import TokenDetails from '../pages/TokenDetails/TokenDetails'
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

const ProtectedAccountDetailsRoute = () => {
    const navigate = useNavigate()
    const isUnlocked = useSelector((state: RootState) => state.wallet.isUnlocked)
    const address = useSelector((state: RootState) => state.wallet.address)
    const walletName = useSelector((state: RootState) => state.wallet.walletName)

    if (!isUnlocked) {
        return <Navigate to="/unlock" replace />
    }

    if (!address) {
        return <Navigate to="/wallet" replace />
    }

    return (
        <AccountDetails
            account={{ address, walletName }}
            onClose={() => navigate(-1)}
        />
    )
}

const AppRoutes = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<StartupGuard />} />
                <Route path="/onboarding" element={<OnboardingGuard />} />
                <Route path="/unlock" element={<Unlock />} />
                <Route path="/wallet" element={<ProtectedWalletRoute />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/account-details" element={<ProtectedAccountDetailsRoute />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/token-details" element={<TokenDetails />} />
                <Route path="/token-details/:tokenId" element={<TokenDetails />} />
                <Route path="/receive" element={<Receive />} />
                <Route path="/import-token" element={<ImportToken />} />
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