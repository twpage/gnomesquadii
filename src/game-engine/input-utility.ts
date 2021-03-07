import * as Bones from '../bones'

export class InputUtility {
    private static processInputCallback: (event: KeyboardEvent) => any;
    private static resolve: (value?: any) => void;

    static waitForInput(handleInput: (event: KeyboardEvent) => Bones.Engine.InputResponse): Promise<Bones.Engine.InputResponse> {
        return new Promise(resolve => {
            if (InputUtility.processInputCallback !== undefined) {
                InputUtility.stopProcessing(null);
            }

            InputUtility.resolve = resolve;
            InputUtility.processInputCallback = (event: KeyboardEvent) => InputUtility.processInput(event, handleInput);
            window.addEventListener("keydown", InputUtility.processInputCallback);
        });
    }

    private static processInput(event: KeyboardEvent, handleInput: (event: KeyboardEvent) => Bones.Engine.InputResponse ): void {
        let input_response = handleInput(event)
        if (input_response.validInput) {
            InputUtility.stopProcessing(input_response)
        }

    }

    private static stopProcessing(input_response : Bones.Engine.InputResponse): void {
        window.removeEventListener("keydown", InputUtility.processInputCallback);
        InputUtility.processInputCallback = undefined;
        InputUtility.resolve(input_response);
    }
}