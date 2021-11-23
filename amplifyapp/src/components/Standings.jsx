import React, { Component } from "react";

class Standing extends Component {
  render() {
    return (
      <tr>
        <td>{this.props.position}</td>
        <td className="badge-td">
          <div className="badge">
            <img src={this.props.badge} alt={this.props.team} />
          </div>
        </td>
        <td className="text-left">{this.props.team}</td>
        <td>{this.props.user}</td>
        <td>{this.props.played}</td>
        <td>{this.props.won}</td>
        <td>{this.props.draw}</td>
        <td>{this.props.lost}</td>
        <td>{this.props.points}</td>
      </tr>
    );
  }
}

export default Standing;
