import { render, screen, fireEvent } from '@testing-library/react'
import ActivityCard from './ActivityCard'

describe("ActivityCard", () => {
  const baseProps = {
    id: "1",
    name: "Yoga",
    emoji: "🧘",
    moodTag: "relax",
    onClick: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, emoji and moodTag", () => {
    render(<ActivityCard {...baseProps} />);
    expect(screen.getByText("Yoga")).toBeInTheDocument();
    expect(screen.getByText("🧘")).toBeInTheDocument();
    expect(screen.getByText("relax")).toBeInTheDocument();
  });

  it("renders without moodTag if not provided", () => {
    render(<ActivityCard {...baseProps} moodTag={null} />);
    expect(screen.getByText("Yoga")).toBeInTheDocument();
    expect(screen.queryByText("relax")).not.toBeInTheDocument();
  });

  it("applies selected class and shows check when selected", () => {
    render(<ActivityCard {...baseProps} selected={true} />);
    expect(screen.getByText("✔")).toBeInTheDocument();
  });

  it("does not show check when not selected", () => {
    render(<ActivityCard {...baseProps} selected={false} />);
    expect(screen.queryByText("✔")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    render(<ActivityCard {...baseProps} />);
    fireEvent.click(screen.getByText("Yoga").closest("div"));
    expect(baseProps.onClick).toHaveBeenCalled();
  });

  
});