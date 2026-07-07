import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../../src/components/SearchBar.jsx';
import clubData from '../../src/data.json';

describe('SearchBar', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders the search input', () => {
    render(
      <SearchBar moves={clubData.moves} styles={clubData.styles} levels={clubData.levels} onSelect={mockOnSelect} />
    );
    expect(screen.getByPlaceholderText('Search moves...')).toBeInTheDocument();
  });

  it('shows results when typing a known move name', () => {
    render(
      <SearchBar moves={clubData.moves} styles={clubData.styles} levels={clubData.levels} onSelect={mockOnSelect} />
    );
    const input = screen.getByPlaceholderText('Search moves...');
    fireEvent.change(input, { target: { value: 'Dile Que No' } });
    // Should show at least one result in the listbox
    const listbox = screen.queryByRole('listbox');
    expect(listbox).toBeTruthy();
    expect(listbox.children.length).toBeGreaterThan(0);
  });

  it('shows "No moves found" for nonsense query', () => {
    render(
      <SearchBar moves={clubData.moves} styles={clubData.styles} levels={clubData.levels} onSelect={mockOnSelect} />
    );
    const input = screen.getByPlaceholderText('Search moves...');
    fireEvent.change(input, { target: { value: 'zzzzzznotarealmove' } });
    expect(screen.getByText(/No moves found/)).toBeInTheDocument();
  });

  it('calls onSelect when clicking a search result', () => {
    render(
      <SearchBar moves={clubData.moves} styles={clubData.styles} levels={clubData.levels} onSelect={mockOnSelect} />
    );
    const input = screen.getByPlaceholderText('Search moves...');
    fireEvent.change(input, { target: { value: 'Dile' } });
    const options = screen.getAllByRole('option');
    if (options.length > 0) {
      fireEvent.click(options[0]);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    }
  });

  it('clears query after selection', () => {
    render(
      <SearchBar moves={clubData.moves} styles={clubData.styles} levels={clubData.levels} onSelect={mockOnSelect} />
    );
    const input = screen.getByPlaceholderText('Search moves...');
    fireEvent.change(input, { target: { value: 'Dile' } });
    const options = screen.getAllByRole('option');
    if (options.length > 0) {
      fireEvent.click(options[0]);
      expect(input.value).toBe('');
    }
  });
});