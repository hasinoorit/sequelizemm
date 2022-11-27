import { Subject } from "rxjs"
import inquirer from "inquirer"
import type { DistinctQuestion } from "inquirer"
import inquirerFileTreeSelection from "inquirer-file-tree-selection-prompt"
export const iAPrompt = () => {
  const prompts = new Subject()
  const _prompt = inquirer.createPromptModule()
  _prompt.registerPrompt("file-tree-selection", inquirerFileTreeSelection)
  const prompt = _prompt(prompts as any)
  const next = (question: DistinctQuestion) => {
    return new Promise<any>((resolve) => {
      const subscription = prompt.ui.process.subscribe((v) => {
        subscription.unsubscribe()
        resolve(v.answer)
      })
      prompts.next(question)
    })
  }
  return { next, complete: prompts.complete }
}

export interface Prompt {
  next: (question: DistinctQuestion) => Promise<any>
  complete: () => void
}

export default iAPrompt
