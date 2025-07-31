
"use client";

import { useState, useEffect, type FormEvent, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  HeartPulse,
  Shield,
  Siren,
  Play,
  Square,
  Send,
  ShieldAlert,
  BellOff,
} from "lucide-react";
import { filterAudioCommands } from "@/ai/flows/filter-audio-commands";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

// Siren sound in base64 format
const SIREN_SOUND_DATA_URI = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAEMAAwEAAAAAAEVOQ08AAAAsAAAATGF2YzU3LjY0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExhbWUAAAARBgAAAQAAAAD/8AABBABRQUEsAAAAIAAIAAAAAAAA//sYxBAIAMCore Media Audio1AwoFgiIs0RAAGYABRERPmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AABBABRQUEsAAAAIAAIAAAAAAAA//sYxBAIAMCore Media Audio1AwoFgiIs0RAAGYABRERPmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AABBABRQUEsAAAAIAAIAAAAAAAA//sYxBAIAMCore Media Audio1AwoFgiIs0RAAGYABRERPmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const SHAKE_THRESHOLD = 15;
const SHAKE_TIMEOUT = 500;
const SHAKE_COUNT_RESET_TIMEOUT = 3000;

export default function GuardianAngelDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [statusText, setStatusText] = useState("Idle");
  const [statusIcon, setStatusIcon] = useState(<HeartPulse className="h-8 w-8 text-primary" />);
  const [isEmergency, setIsEmergency] = useState(false);
  const [command, setCommand] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  const lastShakeTime = useRef(0);
  const shakeCount = useRef(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSiren = () => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(error => console.error("Siren play failed:", error));
    }
  };

  const stopSiren = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  const startVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200, 100, 200]); // Continuous pattern
    }
  };

  const stopVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  };

  const triggerEmergency = useCallback((message: string) => {
    if (isEmergency) return;

    console.log("Emergency Triggered:", message);
    setIsEmergency(true);
    setStatusText("EMERGENCY");
    setStatusIcon(<Siren className="h-8 w-8 text-destructive animate-ping" />);
    speak(message);
    playSiren();
    startVibration();
    makeEmergencyCall();
    sendSMS();
  }, [isEmergency]);

  const handleStopEmergency = () => {
    setIsEmergency(false);
    setIsMonitoring(false);
    setStatusText("Idle");
    setStatusIcon(<HeartPulse className="h-8 w-8 text-primary" />);
    stopSiren();
    stopVibration();
    speak("Emergency alert cancelled.");
  };

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const { accelerationIncludingGravity } = event;
    if (!accelerationIncludingGravity) return;

    const { x, y, z } = accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;
    
    const acceleration = Math.sqrt(x*x + y*y + z*z);

    const now = Date.now();
    if (acceleration > SHAKE_THRESHOLD) {
      if (now - lastShakeTime.current < SHAKE_TIMEOUT) return;

      lastShakeTime.current = now;
      shakeCount.current += 1;

      if (shakeCount.current === 3) {
        triggerEmergency("Shake detected. Emergency initiated.");
      }

      setTimeout(() => {
        shakeCount.current = 0;
      }, SHAKE_COUNT_RESET_TIMEOUT);
    }
  }, [triggerEmergency]);

  useEffect(() => {
    if (isClient) {
      window.addEventListener("devicemotion", handleDeviceMotion);
      return () => {
        window.removeEventListener("devicemotion", handleDeviceMotion);
      };
    }
  }, [isClient, handleDeviceMotion]);


  useEffect(() => {
    let fallTimeout: NodeJS.Timeout;

    if (isMonitoring && !isEmergency) {
      setStatusText("Monitoring for falls...");
      setStatusIcon(<HeartPulse className="h-8 w-8 text-primary animate-pulse" />);
      speak("Monitoring started.");
      // Simulate a fall detection after 5 seconds of monitoring
      fallTimeout = setTimeout(() => {
        triggerEmergency("Fall Detected. Initiating emergency response.");
      }, 5000);
    } else if (!isMonitoring && !isEmergency) {
      setStatusText("Idle");
      setStatusIcon(<HeartPulse className="h-8 w-8 text-primary" />);
    }

    return () => {
      clearTimeout(fallTimeout);
      if (isMonitoring && !isEmergency) {
        speak("Monitoring stopped.");
      }
    };
  }, [isMonitoring, isEmergency, triggerEmergency]);

  const handleToggleMonitoring = () => {
    if (isEmergency) return;
    setIsMonitoring((prev) => !prev);
  };

  const handleEmergencyAlert = () => {
    triggerEmergency("Emergency alert button pressed.");
  };

  const makeEmergencyCall = () => {
    console.log("Attempting to call 877-812-4700");
    window.location.href = "tel:8778124700";
  };
  
  const sendSMS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const message = `Emergency! I need help. My location is: https://www.google.com/maps?q=${latitude},${longitude}`;
          console.log("SMS to be sent:", message);
          // In a real app, you would use a third-party service (like Twilio) to send this SMS.
          // The line below is a placeholder to show how it would be initiated.
          // window.open(`sms:EMERGENCY_CONTACT_NUMBER?body=${encodeURIComponent(message)}`);
          toast({
            title: "SMS Ready",
            description: "Location acquired for SMS alert.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your location for the SMS alert.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  };


  const handleFilterCommand = async (e: FormEvent) => {
    e.preventDefault();
    if (!command.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter a command to filter.",
        variant: "destructive",
      });
      return;
    }

    setIsFiltering(true);
    try {
      const result = await filterAudioCommands({ speech: command });
      if (result.isClear) {
        toast({
          title: "Clear Command Detected",
          description: `Command: "${result.filteredSpeech}". Initiating emergency protocol.`,
        });
        handleEmergencyAlert();
      } else {
        toast({
          title: "Command Unclear",
          description: `Filtered response: "${result.filteredSpeech}". Please be clearer or rephrase your command.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error filtering command:", error);
      toast({
        title: "AI Error",
        description: "Could not process the command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
      setCommand("");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} src={SIREN_SOUND_DATA_URI} />
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">
              Guardian Angel
            </CardTitle>
          </div>
          <CardDescription>Your personal safety companion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border p-6 bg-background">
            <div className="flex items-center gap-4">
               {statusIcon}
               <p className="text-lg font-semibold">{statusText}</p>
            </div>
          </div>
          
          {isEmergency ? (
             <Button onClick={handleStopEmergency} size="lg" variant="destructive">
               <BellOff className="mr-2 h-5 w-5" /> Stop Alert
             </Button>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={handleToggleMonitoring} size="lg" disabled={isEmergency}>
                {isMonitoring ? (
                  <>
                    <Square className="mr-2 h-5 w-5" /> Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Start Monitoring
                  </>
                )}
              </Button>
              <Button
                onClick={handleEmergencyAlert}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isEmergency}
              >
                <Siren className="mr-2 h-5 w-5" /> Emergency Alert
              </Button>
            </div>
          )}


          <Separator />

          <div className="space-y-4">
            <h3 className="text-center font-semibold text-muted-foreground">
              Voice Command Simulation
            </h3>
            <form onSubmit={handleFilterCommand} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type command e.g., 'Call 911'"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                disabled={isFiltering || isEmergency}
                aria-label="Voice command input"
              />
              <Button type="submit" disabled={isFiltering || isEmergency}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center w-full">
            For background detection, shake your phone firmly three times. This feature requires the app to be active in your browser.
          </p>
          <p className="text-xs text-muted-foreground text-center w-full">
            In a real emergency, always dial your local emergency number directly if possible.
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
