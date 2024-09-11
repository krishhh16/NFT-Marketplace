import { Button } from "@/components/ui/button"
import ImageCard from "./ImageCard"

function HeroSection() {
    return (
        <div className='max-w-6xl flex h-full p-10 mx-auto' >
            <div className="w-1/2" >
                <h1 className="text-[4rem] font-[600] text-white ">
                    Create your own Tokens in minutes⏰
                </h1>
                <p className="text-[1.2rem] leading-10 text-white ">
                    In our platforms, you can create your own token, decide the supply and manage it, all in a single platform!
                </p>
                <Button className="p-6 w-[13vw] h-[6vh] text-white gap-2 rounded-xl text-[1rem] mt-10 bg-[#A259FF] " variant={"secondary"} >
                    <i className="ri-rocket-2-line "></i>
                    Get started
                </Button>
                <div className="flex gap-10 mt-8 justify-start" >
                    {
                        [{heading: "240k+", subHeading: "Tokens Created"}, {heading: "50k+", subHeading: "Live tokens"}, {heading: "100k+", subHeading: "Monthly active users"}]
                        .map((item: {heading: String, subHeading: String}) => {
                            return (
                                <div className="text-white" >
                                    <h1
                                        className="font-extrabold text-[1.5rem]" 
                                    >{item.heading}</h1>
                                    <h3
                                        className="text-[1.2rem] font-light "
                                    >{item.subHeading}</h3>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="w-1/2" >
                <ImageCard url={"/_7ae12a71-9f1a-49b2-ba89-28462a1eaaa4.jpg"} author="Zeref" title="Space Blenders"/>
            </div>
        </div>
    )
}

export default HeroSection
