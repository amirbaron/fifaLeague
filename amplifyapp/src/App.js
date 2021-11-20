import React, { useState, useEffect } from "react";
import "./App.css";
import Standing from "./components/Standings";

const App = () => {
  const [standing, setStanding] = useState([]);
  useEffect(() => {
    fetchData(setStanding);
  }, []);
  const id = 2021;
  const fetchData = (setStanding) => {
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
      </div>
    </div>
  );
};
export default App;
