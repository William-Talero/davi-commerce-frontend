import Header from "@/components/header"
import Footer from "@/components/footer"
import UserProfile from "@/components/user-profile"

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <UserProfile />
      </main>
      <Footer />
    </div>
  )
}
