import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MoveOfTheDay from '../../src/components/MoveOfTheDay.jsx';

const mockMove = {
  id: 'move-test-1',
  name: 'Test Move',
  levelId: 'lvl-test',
  description: 'This is a **test** move description with enough text to be meaningful for the excerpt test.',
  tags: ['tag1', 'tag2', 'tag3', 'tag4'],
  videos: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Test Video' }],
};

const mockOnSelectMove = vi.fn();
const mockOnPlayVideo = vi.fn();
const mockOnSpeak = vi.fn();

describe('MoveOfTheDay', () => {
  it('renders the move name', () => {
    render(<MoveOfTheDay move={mockMove} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });

  it('renders "Move of the Day" label', () => {
    render(<MoveOfTheDay move={mockMove} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    expect(screen.getByText('Move of the Day')).toBeInTheDocument();
  });

  it('renders up to 3 tags', () => {
    render(<MoveOfTheDay move={mockMove} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    // tag4 should NOT be present (limited to 3)
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
  });

  it('renders Explore button', () => {
    render(<MoveOfTheDay move={mockMove} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    expect(screen.getByText('Explore This Move')).toBeInTheDocument();
  });

  it('calls onSelectMove when Explore is clicked', () => {
    render(<MoveOfTheDay move={mockMove} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    fireEvent.click(screen.getByText('Explore This Move'));
    expect(mockOnSelectMove).toHaveBeenCalledWith('move-test-1');
  });

  it('returns null when move is not provided', () => {
    const { container } = render(<MoveOfTheDay move={null} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    expect(container.firstChild).toBeNull();
  });

  it('strips markdown from description excerpt', () => {
    render(<MoveOfTheDay move={mockMove} onSelectMove={mockOnSelectMove} onPlayVideo={mockOnPlayVideo} onSpeak={mockOnSpeak} />);
    // The description has **test** — should render as "test" not "**test**"
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
  });
});