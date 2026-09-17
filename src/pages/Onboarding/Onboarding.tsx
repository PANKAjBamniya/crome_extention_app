import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { ArrowRight } from 'lucide-react'
import { onboardingImage } from '../../assets'
import ImageComp from '../../components/ImageComp'

const Onboarding = () => {
    const navigate = useNavigate()

    const onPressCreate = () => {
        navigate('/create-wallet')
    }

    const onPressImport = () => {
        navigate('/import-wallet')
    }

    const termsOfService = () => {
        navigate('/terms')
    }

    const privacyPolicy = () => {
        navigate('/privacy-policy')
    }

    return (
        <div
            className="
                min-h-screen
                w-full
                bg-black
                text-[#FCFAF9]
                overflow-y-auto
            "
        >
            <div className="min-h-screen w-full flex flex-col">

                <div className="flex-1 w-full max-w-[600px] mx-auto px-5 relative">

                    <div className="w-full flex justify-center">
                        <ImageComp
                            src={onboardingImage}
                            alt="Wallet"
                            className="
                                w-full
                                h-[500px]
                                object-contain
                                mt-5
                            "
                        />
                    </div>

                    <div
                        className="
        absolute
        bottom-5
        left-0
        right-0
        w-full
        px-5
        py-10
        flex
        flex-col
        gap-3
    "
                    >
                        <Button
                            title="Create a new account"
                            onClick={onPressCreate}
                            variant="primary"
                            size="large"
                            width="full"
                            align="center"
                            icon={<span><ArrowRight /></span>}
                            iconPosition="right"
                        />

                        <Button
                            title="Already have an account"
                            onClick={onPressImport}
                            variant="secondary"
                            size="large"
                            width="full"
                            align="center"
                            icon={
                                <span className="text-[#5E5E5E]">
                                    <ArrowRight />
                                </span>
                            }
                            iconPosition="right"
                        />

                        <div className="text-center pt-3">
                            <p className="text-xs text-[#5E5E5E] leading-5">
                                By continuing, you agree to our{' '}

                                <button
                                    type="button"
                                    onClick={termsOfService}
                                    className="text-[#FCFAF9] underline hover:text-[#48E5C2]"
                                >
                                    Terms of Use
                                </button>

                                {' '}and{' '}

                                <button
                                    type="button"
                                    onClick={privacyPolicy}
                                    className="text-[#FCFAF9] underline hover:text-[#48E5C2]"
                                >
                                    Privacy Policy
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Onboarding