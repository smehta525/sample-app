using System.ComponentModel.DataAnnotations;

namespace Notes.Api.Contracts;

public sealed record NoteDto(
    Guid Id,
    string Title,
    string Content,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateNoteRequest(
    [Required, StringLength(200)] string Title,
    [Required] string Content);

public sealed record UpdateNoteRequest(
    [Required, StringLength(200)] string Title,
    [Required] string Content);