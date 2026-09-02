import { Check } from 'lucide-react'

function CheckRow ({ label, count, checked, onChange }) {
  return (
    <label className="st-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="st-check__box"><Check size={12} strokeWidth={3} color="#fff" /></span>
      <span>{label}</span>
      {count != null && <span className="st-check__count">{count}</span>}
    </label>
  )
}

export default function FilterRail ({ boards, stars, selectedBoards, selectedStars, onToggleBoard, onToggleStar }) {
  return (
    <div className="st-rail">
      <div>
        <div className="st-rail__title">Ushqimi</div>
        {boards.map(([board, count]) => (
          <CheckRow
            key={board}
            label={board}
            count={count}
            checked={selectedBoards.has(board)}
            onChange={() => onToggleBoard(board)}
          />
        ))}
      </div>

      <div>
        <div className="st-rail__title">Yjet</div>
        {stars.map(([s, count]) => (
          <CheckRow
            key={s}
            label={`${s} yje`}
            count={count}
            checked={selectedStars.has(Number(s))}
            onChange={() => onToggleStar(Number(s))}
          />
        ))}
      </div>
    </div>
  )
}
