
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
  HeartPulse,
  Shield,
  Siren,
  Play,
  Square,
  Send,
  BellOff,
  TestTube2,
  AlertTriangle,
  Vibrate,
} from "lucide-react";
import { filterAudioCommands } from "@/ai/flows/filter-audio-commands";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

// Siren sound in base64 format (WAV for better compatibility)
const SIREN_SOUND_DATA_URI = "data:audio/wav;base64,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";


// Fall Detection Thresholds
const FREEFALL_THRESHOLD = 0.5; // m/s^2
const FREEFALL_TIME_MS = 300;
const IMPACT_THRESHOLD = 25; // m/s^2
const INACTIVITY_THRESHOLD = 1.5; // m/s^2 (near-zero movement)
const INACTIVITY_TIME_MS = 3000; // 3 seconds

const SHAKE_THRESHOLD = 15;
const SHAKE_TIMEOUT = 500;
const SHAKE_COUNT_RESET_TIMEOUT = 3000;
const EMERGENCY_CALL_DELAY = 10; // in seconds

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
  
  // Shake detection refs
  const lastShakeTime = useRef(0);
  const shakeCount = useRef(0);
  
  // Fall detection state refs
  const fallDetectionState = useRef<'IDLE' | 'FREEFALL' | 'IMPACT'>('IDLE');
  const freefallStartTime = useRef<number | null>(null);
  const impactTime = useRef<number | null>(null);

  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const speak = (text: string) => {
    if (isClient && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop any previous speech
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
    if ("vibrate" in navigator) {
      const didVibrate = navigator.vibrate([1000, 500, 1000, 500, 1000]); // Vibrate 1s, pause 0.5s x3
      console.log("Vibration triggered:", didVibrate);
    } else {
      console.warn("Vibration API not supported on this device.");
    }
  };

  const stopVibration = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
      console.log("Vibration stopped");
    }
  };


  const makeEmergencyCall = () => {
    // This function is currently disabled as per user request.
    console.log("Emergency call disabled.");
    // console.log("Attempting to call 877-812-4700");
    // window.location.href = "tel:8778124700";
  };
  
  const triggerFallAlert = useCallback(() => {
    if (isEmergency) return;
    
    console.log("Fall Alert Triggered");
    setIsEmergency(true);
    setStatusText("Fall Detected!");
    setStatusIcon(<AlertTriangle className="h-8 w-8 text-destructive animate-ping" />);
    playSiren();
    startVibration();
    speak("Fall detected. Please check your safety.");
    // No call is made here, just the alert.
  }, [isEmergency]);


  const triggerEmergency = useCallback((message: string) => {
    if (isEmergency) return;

    console.log("Emergency Triggered:", message);
    setIsEmergency(true);
    setStatusIcon(<Siren className="h-8 w-8 text-destructive animate-ping" />);
    playSiren();
    startVibration();
    
    const emergencyMessage = "emergency help help";
    setStatusText("EMERGENCY");
    speak(emergencyMessage);

  }, [isEmergency]);

  const handleStopEmergency = () => {
    setIsEmergency(false);
    setIsMonitoring(false);
    setStatusText("Idle");
    setStatusIcon(<HeartPulse className="h-8 w-8 text-primary" />);
    stopSiren();
    stopVibration();
    speak("Alert cancelled.");

    fallDetectionState.current = 'IDLE';
    freefallStartTime.current = null;
    impactTime.current = null;

    if (emergencyTimeoutRef.current) {
      clearTimeout(emergencyTimeoutRef.current);
      emergencyTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isMonitoring || isEmergency) return;

    const { acceleration } = event;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;
    
    const magnitude = Math.sqrt(x*x + y*y + z*z);
    const now = Date.now();

    // Advanced Fall Detection Logic
    switch (fallDetectionState.current) {
      case 'IDLE':
        if (magnitude < FREEFALL_THRESHOLD) {
          fallDetectionState.current = 'FREEFALL';
          freefallStartTime.current = now;
        }
        break;
      
      case 'FREEFALL':
         if (!freefallStartTime.current) {
            // Should not happen, but as a safeguard
            fallDetectionState.current = 'IDLE';
            break;
        }
        if ((now - freefallStartTime.current) > FREEFALL_TIME_MS) {
             if (magnitude > IMPACT_THRESHOLD) {
                fallDetectionState.current = 'IMPACT';
                impactTime.current = now;
            } else if (magnitude >= FREEFALL_THRESHOLD) {
                // Not a valid freefall, reset
                fallDetectionState.current = 'IDLE';
                freefallStartTime.current = null;
            }
        }
        break;
        
      case 'IMPACT':
         if (!impactTime.current) {
            // Should not happen, but as a safeguard
            fallDetectionState.current = 'IDLE';
            break;
        }
        if ((now - impactTime.current) > INACTIVITY_TIME_MS) {
          if (magnitude < INACTIVITY_THRESHOLD) {
            triggerFallAlert();
          }
          // Reset after check
          fallDetectionState.current = 'IDLE';
          freefallStartTime.current = null;
          impactTime.current = null;
        }
        break;
    }


    // Shake Detection Logic
    if (magnitude > SHAKE_THRESHOLD) {
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
  }, [isMonitoring, isEmergency, triggerEmergency, triggerFallAlert]);

  useEffect(() => {
    if (isClient && isMonitoring) {
      window.addEventListener("devicemotion", handleDeviceMotion);
      return () => {
        window.removeEventListener("devicemotion", handleDeviceMotion);
      };
    }
  }, [isClient, isMonitoring, handleDeviceMotion]);


  useEffect(() => {
    if (isMonitoring && !isEmergency) {
      setStatusText("Monitoring...");
      setStatusIcon(<HeartPulse className="h-8 w-8 text-primary animate-pulse" />);
      speak("Monitoring started.");
    } else if (!isMonitoring && !isEmergency) {
      setStatusText("Idle");
      setStatusIcon(<HeartPulse className="h-8 w-8 text-primary" />);
    }
  }, [isMonitoring, isEmergency]);

  const handleToggleMonitoring = () => {
    if (isEmergency) return;
    
    // If we are currently monitoring, stop it.
    if(isMonitoring) {
      setIsMonitoring(false);
      fallDetectionState.current = 'IDLE';
      freefallStartTime.current = null;
      impactTime.current = null;
      speak("Monitoring stopped.");
      return;
    }

    // If we are not monitoring, start it, but first request permissions.
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
              console.log("Motion permission granted");
              setIsMonitoring(true);
          } else {
            toast({title: "Permission Denied", description: "Motion sensor access is required for fall detection."});
            setIsMonitoring(false);
          }
        })
        .catch((error) => {
          console.error(error);
          toast({title: "Permission Error", description: "Could not request motion sensor permission.", variant: "destructive"});
        });
    } else {
        // For browsers that don't require explicit permission
        setIsMonitoring(true);
    }
  };


  const handleEmergencyAlert = () => {
    triggerEmergency("Emergency alert button pressed.");
  };
  
  const sendSMS = () => {
    if (isClient && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const message = `Emergency! I need help. My location is: https://www.google.com/maps?q=${latitude},${longitude}`;
          console.log("SMS to be sent:", message);
          const smsUri = `sms:?body=${encodeURIComponent(message)}`;
          window.location.href = smsUri;
          toast({
            title: "SMS Ready",
            description: "Opening messaging app to send alert.",
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
    } else if (isClient) {
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
        triggerEmergency(`Voice command: ${result.filteredSpeech}`);
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
  
  const handleTestFall = () => {
    if (isEmergency) {
      toast({ title: "Cannot test during an active emergency.", variant: "destructive" });
      return;
    }
    toast({ title: "Simulating Fall Event", description: "This will trigger the fall alert (siren and voice)." });
    triggerFallAlert();
  };


  if (!isClient) {
    return (
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
        <CardContent>
           <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
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
             <Button onClick={handleStopEmergency} size="lg" variant="destructive" className="w-full">
               <BellOff className="mr-2 h-5 w-5" /> Stop Alert
             </Button>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={handleToggleMonitoring} size="lg">
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
              >
                <Siren className="mr-2 h-5 w-5" /> Emergency Alert
              </Button>
            </div>
          )}


          <Separator />

          <div className="space-y-4">
            <h3 className="text-center font-semibold text-muted-foreground">
              Voice &amp; Test Tools
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
             <div className="grid grid-cols-2 gap-2">
               <Button onClick={handleTestFall} size="sm" variant="outline" className="w-full" disabled={isEmergency}>
                  <TestTube2 className="mr-2 h-4 w-4" /> Simulate Fall
               </Button>
               <Button
                  onClick={() => {
                    console.log("Manual vibration test");
                    startVibration();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isEmergency}
                >
                 <Vibrate className="mr-2 h-4 w-4" /> Test Vibration
                </Button>
             </div>
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
