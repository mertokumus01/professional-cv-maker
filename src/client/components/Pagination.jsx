import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  totalItems = 0,
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      <div style={styles.controls}>
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          style={{
            ...styles.button,
            ...((currentPage === 1) ? styles.buttonDisabled : {}),
          }}
        >
          ← Previous
        </button>

        <div style={styles.pageNumbers}>
          {pageNumbers.map((page, idx) => (
            <span key={idx}>
              {page === '...' ? (
                <span style={styles.ellipsis}>...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page)}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === page ? styles.pageButtonActive : {}),
                  }}
                >
                  {page}
                </button>
              )}
            </span>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          style={{
            ...styles.button,
            ...((currentPage === totalPages) ? styles.buttonDisabled : {}),
          }}
        >
          Next →
        </button>
      </div>

      <div style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginTop: '20px',
  },
  info: {
    fontSize: '13px',
    color: '#666',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  pageNumbers: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  pageButton: {
    width: '32px',
    height: '32px',
    padding: '0',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  pageButtonActive: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  },
  ellipsis: {
    padding: '0 5px',
    color: '#999',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#666',
  },
};
