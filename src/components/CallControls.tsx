
import React from 'react';
import { CallStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, VolumeX, Phone, PhoneOff } from 'lucide-react';

interface CallControlsProps {
  callStatus: CallStatus;
  isUserSpeaking: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

const CallControls: React.FC<CallControlsProps> = ({
  callStatus,
  isUserSpeaking,
  onStartCall,
  onEndCall,
  onToggleMute,
  isMuted
}) => {
  return (
    <div className="flex justify-center mt-6 space-x-4">
      {callStatus === 'idle' && (
        <Button
          onClick={onStartCall}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Phone className="mr-2 h-4 w-4" />
          Start Call
        </Button>
      )}
      
      {callStatus === 'active' && (
        <>
          <Button
            variant="outline"
            onClick={onToggleMute}
            className={isMuted ? "text-red-500 border-red-200" : ""}
          >
            {isMuted ? (
              <>
                <VolumeX className="mr-2 h-4 w-4" />
                Unmute
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Mute
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            onClick={onEndCall}
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            End Call
          </Button>
        </>
      )}
      
      {callStatus === 'connecting' && (
        <Button disabled className="bg-amber-500 text-white">
          Connecting...
        </Button>
      )}
      
      {callStatus === 'disconnected' && (
        <Button
          onClick={onStartCall}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Phone className="mr-2 h-4 w-4" />
          Reconnect
        </Button>
      )}
    </div>
  );
};

export default CallControls;
