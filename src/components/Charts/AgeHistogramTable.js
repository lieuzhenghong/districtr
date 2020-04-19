import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";
import DemographicsTable from "./DemographicsTable";
import Histogram from "./Histogram";

export default function AgeHistogramTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch
) {
    const subgroups = population.subgroups.map((p) => {
        p.name = p.name.replace("Ages ", "").replace("Age ", "").replace("Under ", "<");
        return p;
    });

    let combinedAges = [
      {name: "<15", keys: ["P012003_mf", "P012004_mf", "P012005_mf"]},
      {name: "15–20", keys: ["P012006_mf", "P012007_mf", "P012008_mf"]},
      {name: "21–34", keys: ["P012009_mf", "P012010_mf", "P012011_mf", "P012012_mf"]},
      {name: "35–49", keys: ["P012013_mf", "P012014_mf", "P012015_mf"]},
      {name: "50–64", keys: ["P012016_mf", "P012017_mf", "P012018_mf", "P012019_mf"]},
      {name: "65+", keys: ["P012020_mf", "P012021_mf", "P012022_mf", "P012023_mf", "P012024_mf", "P012025_mf"]}
    ];
    combinedAges.forEach(age => {
      // mimic subgroup model
      age.getAbbreviation = () => age.name;
      age.getSum = (partIndex) => {
        let sum = 0;
        subgroups.forEach(g => {
          if (age.keys.includes(g.key)) {
            sum += g.data[partIndex];
          }
        });
        return sum;
      };
      age.getFractionInPart = (partIndex) => {
        let sum = age.getSum(partIndex),
            total = subgroups[0].total.data[partIndex];
        return (sum === 0) ? 0 : (sum / total);
      };

      age.sum = 0;
      age.total = { sum: 0 };
      subgroups.forEach(g => {
        if (age.keys.includes(g.key)) {
          age.sum += g.sum;
        }
        if (!age.total.sum) {
          age.total.sum = g.total.sum;
        }
      });
    });

    let onChange = (e) => {
      dispatch(
          actions.selectAgeView({
              chart: chartId,
              ageView: e
          })
      );
    };

    return html`
        <section class="toolbar-section">
            ${Parameter({
                label: "View as:",
                element: Select([{name:"Histogram"}, {name:"Percentage"}, {name:"Population"}], onChange)
            })}
            ${chartState.ageView == 1 ? DemographicsTable(combinedAges, parts, false) : null}
            ${chartState.ageView == 2 ? DemographicsTable(combinedAges, parts, "population") : null}
            ${chartState.ageView ? null : Histogram(population.subgroups, parts)}
        </section>
    `;
}