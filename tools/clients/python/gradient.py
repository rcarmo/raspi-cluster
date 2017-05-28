from itertools import tee

# colors are floating-point 3-element tuples (doing RGBA is a matter of setting the component count)
def poly_gradient(colors, steps, components=3):

    def linear_gradient(start, finish, substeps):
        yield start
        for i in range(1, substeps):
            yield tuple([(start[j]+(float(i)/(substeps-1))*(finish[j]-start[j])) for j in range(components)])

    def pairs(seq):
        a, b = tee(seq)
        next(b, None)
        return zip(a, b)

    substeps = int(float(steps)/(len(colors)-1))

    for a, b in pairs(colors):
        for c in linear_gradient(a, b, substeps):
            yield c
