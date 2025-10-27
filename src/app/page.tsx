import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Lock,
  Cpu,
  Shield,
  BarChart,
  Briefcase,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Homomorphic Encryption in Action
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Explore the future of data privacy. Perform computations on
                    encrypted data without ever decrypting it.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/incoming"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    See Demos
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Lock size={200} className="text-muted-foreground/20" />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  The Technology
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  What is Homomorphic Encryption?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Homomorphic encryption is a revolutionary form of encryption
                  that allows for computation on ciphertexts. This generates an
                  encrypted result which, when decrypted, matches the result of
                  operations performed on the plaintext. It means data can be
                  processed by third-party services without exposing the
                  underlying sensitive information.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="use-cases"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Real-World Use Cases
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From finance to healthcare, homomorphic encryption unlocks new
                  possibilities for secure data collaboration.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase /> Secure Salary Processing
                  </CardTitle>
                  <CardDescription>
                    Calculate payroll and bonuses on encrypted salary data. The
                    server computes total payouts without ever knowing
                    individual salaries, ensuring employee confidentiality.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeartHandshake /> Private Risk Scoring
                  </CardTitle>
                  <CardDescription>
                    Aggregate sensitive user data like age, biometrics, and
                    financial history to compute a credit or health risk score,
                    without revealing the private data points to the scoring
                    service.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart /> Confidential Student Analytics
                  </CardTitle>
                  <CardDescription>
                    Analyze student performance by calculating statistical
                    metrics like mean and variance on encrypted grades. This
                    allows for educational research without compromising student
                    privacy.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu /> Smart Meter Privacy
                  </CardTitle>
                  <CardDescription>
                    Aggregate power usage data from smart meters to calculate
                    total and average consumption for grid management, without
                    exposing the energy usage patterns of individual households.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                How It Works: A Simple Flow
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Data is encrypted on the client, processed on the server, and
                decrypted only by the data owner.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 md:grid-cols-3 items-center justify-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center rounded-full bg-secondary p-4">
                  <Shield className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">1. Client Encrypts</h3>
                <p className="text-sm text-muted-foreground">
                  Your sensitive data is encrypted in your browser before it is
                  sent.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center rounded-full bg-secondary p-4">
                  <Cpu className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">2. Proxy Computes</h3>
                <p className="text-sm text-muted-foreground">
                  A remote server performs computations on the encrypted data.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center rounded-full bg-secondary p-4">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">3. Client Decrypts</h3>
                <p className="text-sm text-muted-foreground">
                  The encrypted result is sent back and decrypted only on your
                  device.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Dive In?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Check out the interactive demonstrations to see homomorphic
                encryption in action.
              </p>
            </div>
            <div className="flex justify-center">
              <Link href="/incoming">
                <Button variant="secondary">
                  Explore Demos <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          Homomorphic Encryption Demo. Built by Hitesh Shivkumar and Shreya
          Gupta
        </p>
      </footer>
    </div>
  );
}
