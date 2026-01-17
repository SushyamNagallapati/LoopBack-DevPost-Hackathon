export interface Loop {
    id: string;
    title: string;
    situation: string;
    emotion: string;
    whatMatters: string;
    smallestStep: string;
    bolderStep: string;
    messageDraft?: string;
    messageFor?: string;
    createdAt: string;
    updatedAt: string;
}

export type LoopFormData = {
    situation: string;
    emotion: string;
    whatMatters: string;
};
