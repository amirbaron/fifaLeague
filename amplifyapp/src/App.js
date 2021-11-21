import React, { useState, useEffect } from "react";
import "./App.css";
import Standing from "./components/Standings";

const App = () => {
  const [standing, setStanding] = useState([]);
  const [round, setRound] = useState(0);
  useEffect(() => {
    fetchTeamsData(setStanding);
  }, []);
  useEffect(() => {

  }, [round]);

  const onNextRound = () => {
    const url = "http://example.com";
    fetch(url, {
      method: "POST",
      body: JSON.stringify({ currentUiRound: round }),
    })
      .then((response) => response.json())
      .then((jsonRes) => {
        console.log("json_res: ", jsonRes);
        setRound(round+1);
      })
      .catch(() => console.log("Error"));
  };

  const id = 2021;
  const fetchTeamsData = (setStanding) => {
    const Token = "fe5361a29897453384f17447c82c205c",
      URL =
        "https://api.football-data.org/v2/competitions/" + id + "/standings";

    fetch(URL, { headers: { "X-Auth-Token": Token } })
      .then((response) => response.json())
      .then((response) => {
        const rows = [];
        response.standings[0].table.map((item, index) => {
          const {
            position,
            playedGames,
            won,
            draw,
            lost,
            goalsFor,
            goalsAgainst,
            goalDifference,
            points,
            team,
          } = item;

          return rows.push({
            position: position,
            playedGames: playedGames,
            won: won,
            draw: draw,
            lost: lost,
            goalsFor: goalsFor,
            goalsAgainst: goalsAgainst,
            goalDifference: goalDifference,
            points: points,
            team: team.name,
            badge: team.crestUrl,
          });
        });
        setStanding([...rows]);
      });
  };
  return FootbalApp({ standing, round, onNextRound });
};


const FootbalApp = (props) => {
  const { standing, round, onNextRound } = { ...props };
  let table;

  if (standing.length > 0) {
    table = (
      <thead>
        <tr>
          <td colSpan="9">
            <h3>Premier league</h3>
          </td>
        </tr>
        <tr>
          <th className="position">#</th>
          <th className="team" colSpan="2">
            Team
          </th>
          <th className="played">Played</th>
          <th className="won">Won</th>
          <th className="draw">Draw</th>
          <th className="lost">Lost</th>
          <th className="points">Points</th>
        </tr>
      </thead>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="table-responsive mt-5">
          <table className="table">
            {table}
            <tbody>
              {standing.map((standing) => (
                <Standing
                  key={standing.position}
                  position={standing.position}
                  badge={standing.badge}
                  team={standing.team}
                  played={standing.playedGames}
                  won={standing.won}
                  draw={standing.draw}
                  lost={standing.lost}
                  points={standing.points}
                ></Standing>
              ))}
            </tbody>
          </table>
        </div>
        <div className="play-next-round">
          <button onClick={onNextRound}>
            Simluate matches for round {round}
          </button>
        </div>
      </div>
    </div>
  );
};
export default App;