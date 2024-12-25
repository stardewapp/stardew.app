import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayersContext } from "@/contexts/players-context";
import { parseSaveFile } from "@/lib/file";
import { useContext } from "react";
import Dropzone from "react-dropzone";
import { toast } from "sonner";
import { Button } from "../ui/button";
import pako from "pako";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const UploadDialog = ({ open, setOpen }: Props) => {
  const { activePlayer, uploadPlayers } = useContext(PlayersContext);

  const handleChange = (file: File) => {
    setOpen(false);

    if (typeof file === "undefined" || !file) return;

    if (file.type !== "") {
      toast.error("Invalid file type", {
        description: "Please upload a Stardew Valley save file.",
      });
      return;
    }

    const reader = new FileReader();

    let uploadPromise;

    reader.onloadstart = () => {
      uploadPromise = new Promise((resolve, reject) => {
        reader.onload = async function (event) {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const content = new Uint8Array(arrayBuffer);

            let decompressedContent;
            if (content[0] === 120) {  // This is also how vanilla checks if a save is compressed. Around SaveGame.cs Line 671
              // File is zlib compressed
              const decompressed = pako.inflate(content);
              decompressedContent = new TextDecoder().decode(decompressed);
            } else {
              // File is not compressed
              decompressedContent = new TextDecoder().decode(content);
            }

            const players = parseSaveFile(decompressedContent);
            await uploadPlayers(players);
            resolve("Your save file was successfully uploaded!");
          } catch (err) {
            console.error("Error processing file:", err);
            reject(err instanceof Error ? err.message : "Unknown error.");
          }
        }
      });

      // Start the loading toast
      toast.promise(uploadPromise, {
        loading: "Uploading your save file...",
        success: (data) => `${data}`,
        error: (err) => `There was an error parsing your save file:\n${err}`,
      });

      // Reset the input
      uploadPromise = null;
    };

    // reader.readAsText(file);
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload your save file</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Dropzone
            onDrop={(acceptedFiles) => {
              handleChange(acceptedFiles[0]);
            }}
            useFsAccessApi={false}
          >
            {({ getRootProps, getInputProps }) => (
              <>
                <input className="h-full w-full" {...getInputProps()} />
                <div className="h-[250px]">
                  <div
                    {...getRootProps()}
                    className="flex h-full w-full cursor-pointer select-none items-center justify-center rounded-lg border-2 border-dashed border-gray-800 dark:border-gray-400"
                  >
                    <div className="select-text text-center">
                      <p>
                        Drag and drop your save file here, or click to browse!
                      </p>
                      <br></br>
                      <span className="font-bold">
                        Need help finding your save? Click below for
                        instructions!
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Dropzone>
        </DialogDescription>
        <DialogFooter className="flex w-full">
          <Button
            variant={"secondary"}
            onClick={() => {
              navigator.clipboard.writeText("~/.config/StardewValley/Saves");
              toast.info("Copied the folder location to your clipboard!", {
                description:
                  "To go to this folder, press Cmd+Shift+G in Finder and paste the path. Your save will be located there.",
              });
            }}
            className="w-full"
          >
            Find save on Mac
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              navigator.clipboard.writeText("%appdata%\\StardewValley\\Saves");
              toast.info("Copied the folder location to your clipboard!", {
                description:
                  "To go to this folder, press Windows key + R and paste the path. Your save will be located there.",
              });
            }}
            className="w-full"
          >
            ... Windows
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              navigator.clipboard.writeText("~/.config/StardewValley/Saves");
              toast.info("Copied the folder location to your clipboard!", {
                description:
                  "To go to this folder, press Alt + F2 and paste the path. Your save will be located there.",
              });
            }}
            className="w-full"
          >
            ... or Linux
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
