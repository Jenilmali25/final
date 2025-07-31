"use client";

import { useState, useEffect, type FormEvent } from "react";
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
} from "lucide-react";
import { filterAudioCommands } from "@/ai/flows/filter-audio-commands";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

export default function GuardianAngelDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [statusText, setStatusText] = useState("Idle");
  const [statusIcon, setStatusIcon] = useState(<HeartPulse className="h-8 w-8 text-green-500" />);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [command, setCommand] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let fallTimeout: NodeJS.Timeout;

    if (isMonitoring) {
      setStatusText("Monitoring for falls...");
      setStatusIcon(<HeartPulse className="h-8 w-8 text-green-500 animate-pulse" />);
      // Simulate a fall detection after 5 seconds of monitoring
      fallTimeout = setTimeout(() => {
        setStatusText("Fall Detected!");
        setStatusIcon(<ShieldAlert className="h-8 w-8 text-destructive" />);
        setShowEmergencyDialog(true);
      }, 5000);
    } else {
      setStatusText("Idle");
      setStatusIcon(<HeartPulse className="h-8 w-8 text-green-500" />);
    }

    return () => clearTimeout(fallTimeout);
  }, [isMonitoring]);

  const handleToggleMonitoring = () => {
    setIsMonitoring((prev) => !prev);
  };

  const handleEmergencyAlert = () => {
    setShowEmergencyDialog(true);
  };

  const makeEmergencyCall = () => {
    window.location.href = "tel:8778124700";
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
        setShowEmergencyDialog(true);
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

  return (
    <>
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
              <Siren className="mr-2 h-5 w-5 animate-pulse" /> Emergency Alert
            </Button>
          </div>

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
                disabled={isFiltering}
                aria-label="Voice command input"
              />
              <Button type="submit" disabled={isFiltering}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            In a real emergency, always dial your local emergency number directly if possible.
          </p>
        </CardFooter>
      </Card>

      <AlertDialog
        open={showEmergencyDialog}
        onOpenChange={setShowEmergencyDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Emergency Action</AlertDialogTitle>
            <AlertDialogDescription>
              This action will attempt to place an immediate call to the emergency contact number (877-812-4700). Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={makeEmergencyCall}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm & Call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
