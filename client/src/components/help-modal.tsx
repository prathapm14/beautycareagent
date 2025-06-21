import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Info, Play, Lightbulb } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <HelpCircle className="mr-2 text-primary" />
            How to Play Word Chain
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-primary-light rounded-lg p-4 border-2 border-primary-light">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Info className="mr-2 text-primary" />
              Game Objective
            </h3>
            <p className="text-text-secondary">
              Connect words together in a chain! Each player adds a word that relates to the previous word.
            </p>
          </div>

          <div className="bg-secondary-light rounded-lg p-4 border-2 border-secondary-light">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Play className="mr-2 text-secondary" />
              How to Play
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-text-secondary">
              <li>Players take turns adding words to the chain</li>
              <li>Your word must relate to the previous word</li>
              <li>Type your word and click Submit</li>
              <li>Other players can see the chain grow</li>
              <li>Have fun and be creative!</li>
            </ol>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Lightbulb className="mr-2 text-yellow-600" />
              Examples
            </h3>
            <p className="text-text-secondary mb-2">If the previous word is "OCEAN", you could add:</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border">WAVES</span>
              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border">FISH</span>
              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border">BEACH</span>
              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border">WATER</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg font-medium"
          >
            Got It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
