import type { LoopFormData } from '../types';

/**
 * Deterministic generation of steps based on form data.
 * Uses a simple hash-like approach to create consistent outputs.
 */

const generateHash = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getStepTemplates = (hash: number) => {
  const templates = [
    {
      smallest: [
        'Send a brief text message acknowledging the situation',
        'Take 5 minutes to write down your thoughts',
        'Have a 15-minute conversation with someone you trust',
        'Make a small gesture that shows you care',
        'Set aside 30 minutes to think through options',
        'Send a supportive note',
        'Schedule a time to talk',
        'Do one small thing that aligns with what matters to you',
      ],

      bolder: [
        'Initiate an honest, face-to-face conversation about how you feel',
        'Take concrete action that addresses the core of what matters',
        'Make a commitment to yourself with a specific timeline',
        'Reach out to multiple people who can support you',
        'Change your immediate environment or routine to reflect your values',
        'Set a boundary or make a clear request',
        'Take a significant step toward your long-term goals',
        'Make a decision that might feel risky but aligns with what truly matters',
      ],
    },

    {
      smallest: [
        'Write one sentence about what you want to communicate',
        'Take three deep breaths and check in with yourself',
        'Send a supportive emoji or reaction',
        'Block out 10 minutes in your calendar for this',
        'Identify one person you can talk to',
        'Write down the first thing that comes to mind',
        'Take a short walk to clear your head',
        'Acknowledge the emotion without trying to fix it yet',
      ],

      bolder: [
        'Have a direct conversation about what matters most',
        'Make a decision and take action, even if it feels uncertain',
        'Communicate your needs clearly and ask for support',
        'Commit to a meaningful change in how you approach this',
        'Reach out proactively instead of waiting',
        'Take responsibility for your part and initiate resolution',
        'Prioritize your well-being in a concrete way',
        'Move forward with confidence in what you value',
      ],
    },
  ];
  
  return templates[hash % templates.length];
};

export const generateSteps = (formData: LoopFormData): { smallestStep: string; bolderStep: string } => {
  const situationHash = generateHash(formData.situation);
  const emotionHash = generateHash(formData.emotion);
  const whatMattersHash = generateHash(formData.whatMatters);
  
  const combinedHash = (situationHash + emotionHash + whatMattersHash) % 1000;
  
  const templates = getStepTemplates(combinedHash % 2);
  const smallestIndex = combinedHash % templates.smallest.length;
  const bolderIndex = (combinedHash * 3) % templates.bolder.length;
  
  let smallestStep = templates.smallest[smallestIndex];
  let bolderStep = templates.bolder[bolderIndex];
  
  const whatMattersLower = formData.whatMatters.toLowerCase();
  
  if (whatMattersLower.includes('relationship') || whatMattersLower.includes('connection')) {
    smallestStep = smallestStep.replace('someone', 'this person').replace('person', 'them');
    bolderStep = bolderStep.replace('someone', 'this person').replace('person', 'them');
  }
  
  if (whatMattersLower.includes('work') || whatMattersLower.includes('career')) {
    smallestStep = smallestStep.replace('someone', 'a colleague').replace('person', 'colleague');
    bolderStep = bolderStep.replace('someone', 'a colleague').replace('person', 'colleague');
  }
  
  return {
    smallestStep,
    bolderStep,
  };
};

