import React from 'react'
import { Experiment, jsPsych } from 'jspsych-react'
import { tl } from './timelines/main'
import { MTURK, EXPFACTORY } from './config/main'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { getTurkUniqueId, sleep } from './lib/utils'

const isElectron = !MTURK
let ipcRenderer = false;
let psiturk = false

if (isElectron) {
  const electron = window.require('electron');
  ipcRenderer  = electron.ipcRenderer;
} else if (EXPFACTORY) {
  /* eslint-disable */
  window.lodash = _.noConflict()
  psiturk = new PsiTurk(getTurkUniqueId(), '/finish')
  /* eslint-enable */
} else {
  /* eslint-disable */
  window.lodash = _.noConflict()
  psiturk = new PsiTurk(getTurkUniqueId(), '/complete')
  /* eslint-enable */
}

class App extends React.Component {
  render() {
    console.log("Outside Turk:", jsPsych.turk.turkInfo().outsideTurk)
    console.log("Turk:", MTURK)
    console.log("Expfactory:", EXPFACTORY)

    return (
      <div className="App">
        <Experiment settings={{
          timeline: tl,
          on_data_update: (data) => {
            if ( ipcRenderer ) {
              ipcRenderer.send('data', data)
            }
            else if (psiturk) {
                psiturk.recordTrialData(data)
            }
          },
          on_finish: (data) => {
            if ( ipcRenderer ) {
              ipcRenderer.send('end', 'true')
            }
            else if (EXPFACTORY) {
              const completeExpfactory = async () => {
                psiturk.saveData()
                await sleep(5000)
                console.log(psiturk.taskdata);
                data = {"data": psiturk.taskdata};
                fetch("/save", {
                    method: "POST", 
                    body: JSON.stringify(data)
                }).then(res => {
                   console.log("Request complete! response:", res);
                   psiturk.teardownTask();
                   window.location = psiturk.taskdata.adServerLoc + "/next";
                });
              }
              completeExpfactory()
            }
            else if (psiturk) {
              const completePsiturk = async () => {
                psiturk.saveData()
                await sleep(5000)
                psiturk.completeHIT()
              }
              completePsiturk()
            }
          },
        }}
        />
      </div>
    );
  }
}

export default App
