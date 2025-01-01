'use client'
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const pricingPlans = [
    {
      name: "Basic",
      price: "9",
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ?? "basic price id",
      features: [
        "100 AI-generated posts per month",
        "Twitter thread generation",
        "Basic analytics",
      ],
    },
    {
      name: "Enterprise",
      price: "99",
      priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRICE_PRICE_ID ?? "enterice price id" ,
      features: [
        "Unlimited AI-generated posts",
        "All social media platforms",
        "Custom AI model training",
        "Dedicated account manager",
      ],
    },
  ];

const Pricing = () => {

    const {isSignedIn,user} = useUser()
    const [isLoading,setIsLoading] = useState(false)
    // console.log(isSignedIn?'true':'false')
    // console.log('user',user)

    const handleSubscribe = async(priceId:string)=>{
        console.log('priceId',priceId)

        if(!isSignedIn || !user){
            return
        }
        setIsLoading(true)
        try {
        const response = await fetch("api/create-checkout-session",{
            method:"POST",
            headers:{
                "Content-Type":"applicaiton/json"
            },
            body:JSON.stringify({
                priceId,
                userId:user?.id
            })
        })
        if(!response.ok){
            const errorData =await response.json();
            throw new Error(errorData.error || "failed to create checkout session")
        }
        const {sessionId} = await response.json()
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

        if(!stripe){
            throw new Error("failed to load stripe")
        }

        await stripe.redirectToCheckout({sessionId})

        } catch (error) {
            console.error("Error creating checkout session:", error);
            
        } finally{
            setIsLoading(false)
        }

    }
  return (
    <div className="min-h-screen bg-black text-gray-100">
    <main className="container mx-auto px-8 py-20">
      <h1 className="text-5xl font-bold mb-12 text-center text-white">
        Pricing Plans
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <div
            key={index}
            className="p-8 rounded-lg border border-gray-800 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              {plan.name}
            </h2>
            <p className="text-4xl font-bold mb-6 text-white">
              ${plan.price}
              <span className="text-lg font-normal text-gray-400">
                /month
              </span>
            </p>
            <ul className="mb-8 flex-grow">
              {plan.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className="flex items-center mb-3 text-gray-300"
                >
                  <CheckIcon className="w-5 h-5 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
              disabled={isLoading || !plan.priceId}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              {isLoading ? "Processing..." : "Choose Plan"}
            </Button>
          </div>
        ))}
      </div>
    </main>
  </div>
  )
}

export default Pricing
