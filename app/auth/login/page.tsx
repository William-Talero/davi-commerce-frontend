import Header from "@/components/header"
import Footer from "@/components/footer"
import LoginForm from "@/components/login-form"

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto md:h-screen flex items-center pb-[6rem]  px-4 py-8 flex-grow">
        <div className="md:w-[60%] w-[90%] mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">Iniciar Sesión</h1>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
